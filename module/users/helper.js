/**
 * name : users/helper.js
 * author : Rakesh Kumar
 * Date : 18-March-2020
 * Description : Consist of User creation and user related information.
 */

let formsHelper = require(MODULES_BASE_PATH + "/forms/helper");

let userManagementService =
    require(ROOT_PATH + "/generics/services/user-management");

let sunbirdService =
    require(ROOT_PATH + "/generics/services/sunbird");

let kendrService =
    require(ROOT_PATH + "/generics/services/kendra-service");

const csv = require('csvtojson');

module.exports = class UsersHelper {

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
                    await sunbirdService.getUserProfileInfo(token, userId);

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

                organisations = await _getOrganisationlist(userProfileInfo, userId, token);


                let platformRoles =
                    await database.models.platformRolesExt.find({ isDeleted: false }, {
                        code: 1,
                        title: 1,
                        isHidden: 1
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
                        if (!platformRole.isHidden || platformRole.isHidden != true) {
                            roles.push({
                                label: platformRole.title,
                                value: platformRole.code
                            })
                        }

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
   * @param  {json} requestedData  - requested body.
   * @param  {String} userToken  - user access token
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
 * To update user infromation.
 * @method
 * @name  update
 * @param  {String} updateInfo  - requested body.
 * @param  {String} userToken  - user access token
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


                return resolve(updateUser);
            } catch (error) {
                return reject(error);
            }
        })
    }

    /**
   * To activate the user.
   * @method
   * @name  activate
   * @param  {userId}  - userId
   * @param  {userToken}  - user access token
   * @returns {json} Response consists of updated user details.
   */

    static activate(userId, userToken) {
        return new Promise(async (resolve, reject) => {
            try {
                let statusUpdateUserInfo =
                    await userManagementService.activate(
                        userId,
                        userToken
                    );
                return resolve(statusUpdateUserInfo);
            } catch (error) {
                return reject(error);
            }
        })
    }

    /**
   * To in-activate the user.
   * @method
   * @name  inactivate
   * @param  {userId}  - userId
   * @param  {userToken}  - user access token
   * @returns {json} Response consists of updated user details.
   */

    static inactivate(userId, userToken) {
        return new Promise(async (resolve, reject) => {
            try {
                let statusUpdateUserInfo =
                    await userManagementService.inactivate(
                        userId,
                        userToken
                    );
                return resolve(statusUpdateUserInfo);
            } catch (error) {
                return reject(error);
            }
        })
    }

    /**
    * To get user details.
    * @method
    * @name  details
    * @param  {String} userId  - userId
    * @param  {String} userToken  - user access token
    * @param {String} orgAdminUserId - admin user id
    * @returns {json} Response consists of user details.
    */

    static details(userId, userToken, orgAdminUserId) {
        return new Promise(async (resolve, reject) => {
            try {

                let profileData =
                    await sunbirdService.getUserProfileInfo(userToken, userId);
                profileData = JSON.parse(profileData);
                let userCustomeRole = await database.models.userExtension.findOne({ userId: orgAdminUserId }, { roles: 1 });
                if (profileData.responseCode == constants.common.RESPONSE_OK) {

                    let orgInfo = [];
                    let organisationsList = await _getOrganisationlist(profileData, orgAdminUserId, userToken);
                    let apiAccessUserData =
                        await sunbirdService.getUserProfileInfo(userToken, orgAdminUserId);
                    apiAccessUserData = JSON.parse(apiAccessUserData);
                    if (apiAccessUserData.responseCode != constants.common.RESPONSE_OK) {
                        reject({
                            status: httpStatusCode["bad_request"].status,
                            message: constants.apiResponses.INVALID_ACCESS
                        });
                    }
                    let orgFound = false;
                    if (userCustomeRole && userCustomeRole.roles) {
                        userCustomeRole.roles.map(custRole => {
                            if (custRole.code == constants.common.PLATFROM_ADMIN_ROLE) {
                                orgFound = true;
                            }
                        })
                    }

                    let adminUserOrganisation = [];
                    if (apiAccessUserData.result.response &&
                        apiAccessUserData.result.response.organisations &&
                        apiAccessUserData.result.response.organisations.length > 0) {
                        apiAccessUserData.result.response.organisations.map(data => {
                            adminUserOrganisation.push(data.organisationId);

                        })

                    }
                    if (adminUserOrganisation && adminUserOrganisation.length > 0) {

                        if (profileData.result.response &&
                            profileData.result.response.organisations &&
                            profileData.result.response.organisations.length > 0) {
                            profileData.result.response.organisations.map(data => {

                                if (adminUserOrganisation.includes(data.organisationId)) {
                                    orgFound = true;
                                }
                            });
                        }
                    }

                    if (orgFound == false) {
                        reject({
                            status: httpStatusCode["bad_request"].status,
                            message: constants.apiResponses.INVALID_ACCESS
                        });

                    } else {
                        let userDetails = {};
                        if (profileData.result) {
                            let platformRoles =
                                await database.models.platformRolesExt.find({ isDeleted: false }, {
                                    code: 1,
                                    title: 1,
                                    isHidden: 1
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

                                    // if (sunBirdrole.id != constants.common.PUBLIC_ROLE) {
                                    roles.push({
                                        label: sunBirdrole.name,
                                        value: sunBirdrole.id
                                    })
                                    //    }

                                });
                            }

                            if (platformRoles.length > 0) {
                                await Promise.all(platformRoles.map(platformRole => {

                                    if (!platformRole.isHidden || platformRole.isHidden != true) {
                                        roles.push({
                                            label: platformRole.title,
                                            value: platformRole.code
                                        })
                                    }
                                }));
                            }

                            if (roles) {
                                roles = roles.sort(gen.utils.sortArrayOfObjects("label"));
                            }

                            let userDoc = await database.models.userExtension.findOne({ userId: userId }, { organisationRoles: 1 });
                            if (profileData.result.response &&
                                profileData.result.response.organisations &&
                                profileData.result.response.organisations.length > 0) {
                                profileData.result.response.organisations.map(data => {
                                    var results = organisationsList.filter(function (orgData) {
                                        return orgData.value === data.organisationId
                                    });

                                    let allRoles = [];
                                    if (data && data.roles && data.roles.length > 0) {
                                        data.roles.map(function (sunbirdUserRole) {

                                            if (sunbirdUserRole) {

                                                console.log("sunbirdUserRole", sunbirdUserRole);

                                                let roleInfo = roles.filter(function (roleDetails) {
                                                    return roleDetails.value === sunbirdUserRole
                                                });
                                                allRoles.push(roleInfo[0]);
                                            }
                                        })
                                    }

                                    if (userDoc) {
                                        if (userDoc.organisationRoles) {
                                            let orgRolesOfUser = [];
                                            userDoc.organisationRoles.map(userRoles => {
                                                if (data.organisationId == userRoles.organisationId) {
                                                    orgRolesOfUser.push(...userRoles.roles);
                                                }
                                            })

                                            orgRolesOfUser.map(element => {
                                                let roleInfo = roles.filter(function (roleDetails) {
                                                    return roleDetails.value === element.code
                                                });
                                                allRoles.push(roleInfo[0]);
                                            });
                                        }
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

                            let userDeactiveStatus = await _checkDeactiveAccess(profileData, orgAdminUserId);

                            userDetails = {
                                userDeactiveAccess: userDeactiveStatus.userDeactiveAccess,
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

                            reject({ message: profileData.params.errmsg });
                        }


                    }

                } else {
                    reject({ message: profileData.params.errmsg });
                }
            } catch (error) {
                console.log("error", error);
                return reject(error);
            }
        })
    }

    /**
    * To download bulk upload user sample csv
    * @method
    * @name  bulkUploadSampleFile
    * @param  {String} userToken  - user access token
    * @returns {json} Response consists sample csv data
    */

    static bulkUploadSampleFile(token) {
        return new Promise(async (resolve, reject) => {
            try {

                let fileInfo = {
                    sourcePath: constants.common.SAMPLE_USERS_CSV,
                    bucket: process.env.STORAGE_BUCKET,
                    cloudStorage: process.env.CLOUD_STORAGE,
                }

                let response = await kendrService.getDownloadableUrls(fileInfo, token);
                resolve(response);

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
  * @param { Arrya } groups - Array of groups.
  * @param {String} entityTypeId - entity type mongo object id
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
  * To get organisations list
  * @method
  * @name _getOrganisationlist
  * @param { object } userProfileInfo - user profile information
  * @param  {String} userId  - userId
  * @param  {String} userToken  - user access token
  * @returns {boolean} return boolen value
  * */

function _getOrganisationlist(userProfileInfo, userId, token) {
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
                let request = {
                    "filters": {
                    }
                }
                let organisationList = await sunbirdService.searchOrganisation(request, token);
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
                                    id: organisation.organisationId
                                }
                            }
                            let organisationList = await sunbirdService.searchOrganisation(request, token);
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

/**
 * check user deactive access
 * @method
 * @name _checkDeactiveAccess
 * @param { object } userProfileInfo - userprofile infomration.
 * @param { object } userId - user keyclock id
 * @returns {Object}
 * */
function _checkDeactiveAccess(userProfileInfo, userId) {
    return new Promise(async (resolve, reject) => {
        try {
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
                resolve({ userDeactiveAccess: true })
            } else if (
                userProfileInfo &&
                userProfileInfo.result &&
                userProfileInfo.result.response &&
                userProfileInfo.result.response.organisations
            ) {

                let orgInfo = [];
                orgInfo = userProfileInfo.result.response.organisations;
                if (orgInfo.length > 0) {
                    let count = 0;
                    await Promise.all(orgInfo.map(function (element) {
                        if (element.roles.includes(constants.common.ORG_ADMIN_ROLE)) {
                            count = count + 1;
                        }
                    }));
                    if (count == orgInfo.length) {
                        resolve({ userDeactiveAccess: true })
                    } else {
                        resolve({ userDeactiveAccess: false })
                    }
                } else {
                    resolve({ userDeactiveAccess: false })
                }

            }

        } catch (err) {
            return reject(err);
        }
    });
}