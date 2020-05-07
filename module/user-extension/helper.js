/**
 * name : user-creation/helper.js
 * author : Rakesh Kumar
 * Date : 18-March-2020
 * Description : Consist of User creation and user related information.
 */

let formsHelper = require(MODULES_BASE_PATH + "/forms/helper");

let userManagementService =
    require(ROOT_PATH + "/generics/services/user-management");

let sunBirdService =
    require(ROOT_PATH + "/generics/services/sunbird");

module.exports = class UserCreationHelper {

    /**
   * Get user creation form.
   * @method
   * @name  getForm
   * @param  {userId}  - User id.
   * @param  {token}  - authentication user token.
   * @returns {json} Response consists of user creation form.
   */

    static getForm(userId, token) {
        return new Promise(async (resolve, reject) => {
            try {

                let formData =
                    await formsHelper.list({
                        name: constants.common.USER_CREATE_FORM
                    }, {
                        value: 1
                    });

                if (!formData[0]) {

                    return resolve({
                        status: httpStatusCode["bad_request"].status,
                        message:
                            constants.apiResponses.USER_CREATE_FORM_NOT_FOUND
                    });

                }

                let stateInfo = await database.models.entities.find(
                    {
                        entityType: constants.common.STATE_ENTITY_TYPE
                    },
                    {
                        entityTypeId: 1,
                        _id: 1,
                        metaInformation: 1,
                        groups: 1,
                        childHierarchyPath: 1
                    }
                ).lean();

                let states = [];
                let stateListWithSubEntities = [];
                let stateInfoWithSub = {};

                await Promise.all(stateInfo.map(async function (state) {

                    if (state.groups) {

                        let found =
                            await _checkStateWithSubEntities(
                                state.groups,
                                state.entityTypeId
                            );

                        if (found && state.groups) {
                            stateInfoWithSub[state._id] = state.childHierarchyPath;
                        }
                    }

                    states.push({
                        label: state.metaInformation.name,
                        value: state._id
                    });
                }));
                if (states) {
                    states = states.sort(gen.utils.sortArrayOfObjects('label'));
                }


                let profileInfo =
                    await sunBirdService.getUserProfileInfo(token, userId);

                let organisations = [];

                let userProfileInfo = JSON.parse(profileInfo);


                // let profileRoles;
                // if (userProfileInfo &&
                //     userProfileInfo.result &&
                //     userProfileInfo.result.response &&
                //     userProfileInfo.result.response.roles
                // ) {
                //     profileRoles = userProfileInfo.result.response.roles;
                // }

                // let userCustomeRole = await database.models.platformUserRolesExt.findOne({ userId: userId }, { roles: 1 });

                // if (userCustomeRole && userCustomeRole.roles && userCustomeRole.roles.length > 0) {
                //     userCustomeRole.roles.map(customRole => {
                //         if (!profileRoles.includes(customRole.code)) {
                //             profileRoles.push(customRole.code)
                //         }
                //     })
                // }

                organisations = await _getOrganisationlist(userProfileInfo, userId,token);


                let platformRoles =
                    await database.models.platformRolesExt.find({ isHidden: false }, {
                        code: 1,
                        title: 1
                    }).lean();

                let roles = [];
                let sunBirdRoles =
                    await cassandraDatabase.models.role.findAsync(
                        {
                            status: 1
                        }, {
                        select: ["id", "name"], raw: true, allow_filtering: true
                    });

                if (sunBirdRoles) {
                    sunBirdRoles.map(function (sunBirdrole) {

                        if (sunBirdrole.id != constants.common.PUBLIC_ROLE) {
                            roles.push({
                                label: sunBirdrole.name,
                                value: sunBirdrole.id
                            })
                        }

                    });
                }

                if (platformRoles.length > 0) {

                    await Promise.all(platformRoles.map(platformRole => {
                        roles.push({
                            label: platformRole.title,
                            value: platformRole.code
                        })
                    }));
                }


                if (roles) {
                    roles = roles.sort(gen.utils.sortArrayOfObjects("label"));
                }


                stateListWithSubEntities.push(stateInfoWithSub);

                let forms = [];


                formData[0].value.map(
                    async function (fields) {

                        if (fields.field == "state") {
                            fields.options = states;

                        } else if (fields.field == "organisation") {
                            fields.options = organisations;

                        } else if (fields.field == "roles") {
                            fields.options = roles;
                        }
                        forms.push(fields);
                    });

                return resolve({
                    message: constants.apiResponses.FETCH_USER_CREATION_FORM,
                    result: {
                        form: forms,
                        stateListWithSubEntities: stateListWithSubEntities
                    }
                });


            } catch (error) {
                return reject(error);
            }
        })
    }

    /**
   * create create.
   * @method
   * @name  create
   * @param  {requestedData}  - requested body.
   * @returns {json} Response consists of created user.
   */

    static create(requestedBodyData, userToken) {
        return new Promise(async (resolve, reject) => {
            try {

                let userProfileCreationData =
                    await userManagementService.createPlatFormUser(
                        requestedBodyData,
                        userToken
                    );

                return resolve(userProfileCreationData);
            } catch (error) {
                return reject(error);
            }
        })
    }

    /**
 * update.
 * @method
 * @name  update
 * @param  {requestedData}  - requested body.
 * @returns {json} Response consists of updated user details.
 */

    static update(updateInfo, userToken) {
        return new Promise(async (resolve, reject) => {
            try {

                let updateData = {
                    userId: updateInfo.userId,
                    firstName: updateInfo.firstName,
                    lastName: updateInfo.lastName
                }

                if (updateInfo.dob) {
                    updateData['dob'] = updateInfo.dob;
                }

                let updateUser =
                    await userManagementService.updatePlatFormUser(
                        updateData,
                        userToken
                    );

                console.log("updateUser", updateUser);

                return resolve(updateUser);
            } catch (error) {
                return reject(error);
            }
        })
    }

    /**
   * statusUpdate.
   * @method
   * @name  statusUpdate
   * @param  {userId}  - userId
   * @param  {userToken}  - user token
   * @returns {json} Response consists of updated user details.
   */

    static statusUpdate(userId, userToken, status) {
        return new Promise(async (resolve, reject) => {
            try {


                let statusUpdateUserInfo =
                    await userManagementService.statusUpdate(
                        userId,
                        userToken,
                        status
                    );


                return resolve(statusUpdateUserInfo);
            } catch (error) {
                return reject(error);
            }
        })
    }


    /**
    * to get userDetails.
    * @method
    * @name  userDetails
    * @param  {userId}  - userId
    * @param  {userToken}  - user token
    * @returns {json} Response consists of user details.
    */

    static details(userId, userToken, orgAdminUserId) {
        return new Promise(async (resolve, reject) => {
            try {

                let profileData =
                    await sunBirdService.getUserProfileInfo(userToken, userId);


                profileData = JSON.parse(profileData);
                if (profileData.responseCode == "OK") {


                    let userDetails = {};
                    if (profileData.result) {



                        let platformRoles =
                            await database.models.platformRolesExt.find({ isHidden: false }, {
                                code: 1,
                                title: 1
                            }).lean();

                        let roles = [];
                        let sunBirdRoles =
                            await cassandraDatabase.models.role.findAsync(
                                {
                                    status: 1
                                }, {
                                select: ["id", "name"], raw: true, allow_filtering: true
                            });

                        if (sunBirdRoles) {
                            sunBirdRoles.map(function (sunBirdrole) {

                                if (sunBirdrole.id != constants.common.PUBLIC_ROLE) {
                                    roles.push({
                                        label: sunBirdrole.name,
                                        value: sunBirdrole.id
                                    })
                                }

                            });
                        }

                        if (platformRoles.length > 0) {

                            await Promise.all(platformRoles.map(platformRole => {
                                roles.push({
                                    label: platformRole.title,
                                    value: platformRole.code
                                })
                            }));
                        }

                        if (roles) {
                            roles = roles.sort(gen.utils.sortArrayOfObjects("label"));
                        }

                        let orgInfo = [];
                        let organisationsList = await _getOrganisationlist(profileData, orgAdminUserId,userToken);

                        console.log("organisationsList",organisationsList);
                        if (profileData.result.response &&
                             profileData.result.response.organisations && 
                             profileData.result.response.organisations.length > 0){
                            profileData.result.response.organisations.map(data => {
                                var results = organisationsList.filter(function (orgData) {
                                    return orgData.value === data.organisationId
                                });



                                let allRoles = [];
                                if (data && data.roles && data.roles.length > 0) {
                                    data.roles.map(function (sunbirdUserRole) {

                                        if (sunbirdUserRole && sunbirdUserRole!= constants.common.PUBLIC_ROLE) {

                                            let roleInfo = roles.filter(function (roleDetails) {
                                                return roleDetails.value === sunbirdUserRole
                                            });
                                            allRoles.push(roleInfo[0]);
                                        }
                                    })
                                }

                                orgInfo.push({
                                    label: results[0].label,
                                    value: data.organisationId,
                                    roles: allRoles
                                })
                            });
                       }

                    let gender = profileData.result.response.gender == "M" ? "Male" : profileData.result.response.gender == "F" ? "Female" : "";

                    let reponseObj = profileData.result.response;

                    userDetails = {
                        firstName: reponseObj.firstName,
                        gender: gender,
                        userName: reponseObj.userName,
                        lastName: reponseObj.lastName,
                        email: reponseObj.email,
                        phoneNumber: reponseObj.phone,
                        status: reponseObj.status,
                        dob: reponseObj.dob,
                        lastLoginTime: reponseObj.lastLoginTime,
                        createdDate: reponseObj.createdDate,
                        organisations: orgInfo,
                        roles: [],
                        organisationsList: []
                    }








                    userDetails.roles = roles;
                    userDetails.organisationsList = organisationsList;
                    resolve({ result: userDetails });

                } else {

                    reject({ message: profileData });
                }
            } else {
                reject({ message: profileData });
            }
        } catch (error) {
            console.log("error", error);
            return reject(error);
        }
    })
}

};

/**
  * check state has subEntities
  * @method
  * @name _checkStateWithSubEntities
  * @param { string } stateId - Array of entities.
  * @returns {boolean}
  * */

function _checkStateWithSubEntities(groups, entityTypeId) {
    return new Promise(async (resolve, reject) => {
        try {


            let entityTypeList = Object.keys(groups);
            let entityTypeDoc =
                await database.models.entityTypes.findOne({
                    _id: entityTypeId
                }, { immediateChildrenEntityType: 1 }).lean();
            if (entityTypeDoc && entityTypeDoc.immediateChildrenEntityType &&
                entityTypeDoc.immediateChildrenEntityType.length > 0) {

                Promise.all(entityTypeList.map(async function (types) {
                    if (entityTypeDoc.immediateChildrenEntityType.includes(types)) {
                        resolve(true);
                    }
                }));
                resolve(false)
            } else {
                resolve(false);
            }
        } catch (err) {
            return reject(err);
        }
    });
}


/**
  * get organisations list
  * @method
  * @name _getOrganisationlist
  * @param { object }  - organisationInfo Array of entities.
  * @returns {boolean}
  * */

function _getOrganisationlist(userProfileInfo, userId,token) {
    return new Promise(async (resolve, reject) => {
        try {

            let organisations = [];

            let profileRoles;
            if (userProfileInfo &&
                userProfileInfo.result &&
                userProfileInfo.result.response &&
                userProfileInfo.result.response.roles
            ) {
                profileRoles = userProfileInfo.result.response.roles;
            }

            let userCustomeRole = await database.models.userExtension.findOne({ userId: userId }, { roles: 1 });

            if (userCustomeRole && userCustomeRole.roles && userCustomeRole.roles.length > 0) {
                userCustomeRole.roles.map(customRole => {
                    if (!profileRoles.includes(customRole.code)) {
                        profileRoles.push(customRole.code)
                    }
                })
            }

            if (profileRoles.includes(constants.common.PLATFROM_ADMIN_ROLE)) {

                // let organisationsDoc = await cassandraDatabase.models.organisation.findAsync({},
                //     { raw: true, select: ["orgname", "id"] });

                // let organisationsDoc = await sunBirdService. 
                
                let request = {
                    "filters": {
                    }
                }
                let organisationList = await sunBirdService.searchOrganisation(request, token);
                if (organisationList.responseCode == constants.common.RESPONSE_OK) {
                    if (organisationList.result && organisationList.result.response &&
                        organisationList.result.response && organisationList.result.response.content) {
                        await Promise.all(organisationList.result.response.content.map(async function (orgInfo) {

                            let orgDetails = {
                                label: orgInfo.orgName,
                                value: orgInfo.id
                            }
                            organisations.push(orgDetails);

                        }))
                    }
                }
                // if (organisationsDoc) {
                //     await Promise.all(organisationsDoc.map(function (orgInfo) {

                //         let orgDetails = {
                //             label: orgInfo.orgname,
                //             value: orgInfo.id
                //         }
                //         organisations.push(orgDetails);
                //     }));
                // }

            }
            else if (
                userProfileInfo &&
                userProfileInfo.result &&
                userProfileInfo.result.response &&
                userProfileInfo.result.response.organisations
            ) {

                await Promise.all(
                    userProfileInfo.result.response.organisations.map(
                        async function (organisation) {

                            // let organisationDetails =
                            //     await cassandraDatabase.models.organisation.findOneAsync(
                            //         {
                            //             id: organisation.organisationId
                            //         }, {
                            //         raw: true
                            //     });

                                let request = {
                                    "filters": {
                                        id:organisation.organisationId
                                    }
                                }
                                let organisationList = await sunBirdService.searchOrganisation(request, token);
                                if (organisationList.responseCode == constants.common.RESPONSE_OK) {
                                    if (organisationList.result && organisationList.result.response &&
                                        organisationList.result.response && organisationList.result.response.content) {
                                        await Promise.all(organisationList.result.response.content.map(async function (orgInfo) {
                
                                            // let orgDetails = {
                                            //     label: orgInfo.orgname,
                                            //     value: orgInfo.id
                                            // }
                                            organisations.push({
                                                label: orgInfo.orgName,
                                                value: orgInfo.id
                                            });
                
                                        }))
                                    }
                                }


                            // if (organisationDetails) {

                            //     organisations.push({
                            //         "label": organisationDetails.orgname,
                            //         "value": organisation.organisationId
                            //     });
                            // }

                        }));
            }

            if (organisations) {
                organisations = organisations.sort(gen.utils.sortArrayOfObjects('label'));
            }

            resolve(organisations);

        } catch (err) {
            return reject(err);
        }
    });
}