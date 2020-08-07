/**
 * name : users/helper.js
 * author : Rakesh Kumar
 * Date : 18-March-2020
 * Description : Consist of user creation and user related information.
 */

const entitiesHelper = require("../entities/helper");

const formsHelper = require(MODULES_BASE_PATH + "/forms/helper");
const userManagementService =
    require(GENERIC_SERVICES_PATH + "/user-management");
const sunbirdService =
    require(GENERIC_SERVICES_PATH + "/sunbird");
const kendraService =
    require(GENERIC_SERVICES_PATH + "/kendra-service");
const rolesHelper = require(MODULES_BASE_PATH + "/roles/helper");
const entityTypeHelper = require(MODULES_BASE_PATH + "/entityTypes/helper");
const platformRolesHelper = require(MODULES_BASE_PATH + "/platformRoles/helper");
const sessionHelpers = require(GENERIC_HELPERS_PATH + "/sessions");

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
                        name: CONSTANTS.common.USER_CREATE_FORM
                    }, {
                        value: 1
                    });

                if (!formData[0]) {
                    return resolve({
                        status: HTTP_STATUS_CODE["bad_request"].status,
                        message:
                            CONSTANTS.apiResponses.USER_CREATE_FORM_NOT_FOUND
                    });
                }

                let projection = ["entityTypeId", "metaInformation", "groups", "childHierarchyPath"];

                let stateInfo = await entitiesHelper.entityDocuments({
                    entityType: CONSTANTS.common.STATE_ENTITY_TYPE
                }, projection);

                stateInfo = stateInfo.data;
                let states = [];
                let stateListWithSubEntities = [];
                let stateInfoWithSub = {};

                stateInfo.map(async function (state) {
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
                });

                if (states) {
                    states = states.sort(UTILS.sortArrayOfObjects('label'));
                }

                let organisations = await _getOrganisationlist(token, userId);
                let roles = [];

                let rolesDoc = await platformRolesHelper.getRoles();
                let sunbirdRolesDoc = await rolesHelper.list();

                if (sunbirdRolesDoc.result) {
                    sunbirdRolesDoc.result.map(function (sunbirdRole) {
                        if (sunbirdRole) {
                            let role = {
                                label: sunbirdRole.name,
                                value: sunbirdRole.id
                            }
                            roles.push(role);
                        }
                    });
                }

                let rolesDocuments = [];
                if (rolesDoc && rolesDoc.result) {
                    rolesDocuments = rolesDoc.result;
                    rolesDocuments.map(function (roleDoc) {
                        if (roleDoc) {
                            let role = {
                                label: roleDoc.title,
                                value: roleDoc.code
                            }
                            roles.push(role);
                        }
                    });
                }

                if (roles) {
                    roles = roles.sort(UTILS.sortArrayOfObjects("label"));
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
                    message: CONSTANTS.apiResponses.FETCH_USER_CREATION_FORM,
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
                    await userManagementService.createPlatformUser(
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

                let profileData = await sunbirdService.getUserProfileInfo(userToken, userId);
                if (profileData.status == HTTP_STATUS_CODE.ok.status) {

                    let role = await _getUserRoles(orgAdminUserId);

                    let orgInfo = [];

                    let organisationsList = await _getOrganisationlist(userToken, orgAdminUserId);

                    let userDocument = await database.models.userExtension.findOne({ userId: userId }, { organisations: 1, organisationRoles: 1 });

                    let usersOrganisations = [];
                    if (userDocument && userDocument.organisations) {
                        userDocument.organisations.map(organisations => {
                            usersOrganisations.push(organisations.value);
                        });
                    }


                    let grantAccess = false;

                    if (role.includes(CONSTANTS.common.PLATFROM_ADMIN_ROLE)) {
                        grantAccess = true;
                    }

                    organisationsList.map(orgInfo => {
                        if (usersOrganisations.includes(orgInfo.value)) {
                            grantAccess = true;
                        }
                    });

                    if (grantAccess == false) {
                        reject({
                            status: HTTP_STATUS_CODE["bad_request"].status,
                            message: CONSTANTS.apiResponses.INVALID_ACCESS
                        });

                    } else {
                        let userDetails = {};
                        let roles = [];

                        let rolesDoc = await platformRolesHelper.getRoles();
                        let sunbirdRolesDoc = await rolesHelper.list();

                        if (sunbirdRolesDoc.result) {
                            sunbirdRolesDoc.result.map(function (sunbirdRole) {
                                if (sunbirdRole) {
                                    let role = {
                                        label: sunbirdRole.name,
                                        value: sunbirdRole.id
                                    }
                                    roles.push(role);
                                }
                            });
                        }

                        let rolesDocuments = [];
                        if (rolesDoc && rolesDoc.result) {
                            rolesDocuments = rolesDoc.result;
                            rolesDocuments.map(function (roleDoc) {
                                if (roleDoc) {
                                    let role = {
                                        label: roleDoc.title,
                                        value: roleDoc.code
                                    }
                                    roles.push(role);
                                }
                            });
                        }


                        if (roles) {
                            roles = roles.sort(UTILS.sortArrayOfObjects("label"));
                        }

                        let usersOrganisationList = [];
                        if (userDocument.organisations) {
                            userDocument.organisations.map(userOrg => {
                                usersOrganisationList.push(userOrg);
                            });
                        }


                        let orgInfo = [];
                        if (userDocument.organisationRoles) {

                            userDocument.organisationRoles.map(userOrgRoles => {
                                let organisationData = usersOrganisationList.filter(function (organisation) {
                                    return organisation.value === userOrgRoles.organisationId
                                });


                                if (organisationData[0]) {

                                    let orgnisationRoles = [];
                                    userOrgRoles.roles.map(organisationRoles => {
                                        orgnisationRoles.push({ label: organisationRoles.name, value: organisationRoles.code })
                                    });
                                    orgInfo.push({
                                        label: organisationData[0].label,
                                        value: organisationData[0].value,
                                        roles: orgnisationRoles
                                    })
                                }
                            });
                        }

                        let gender = profileData.result.response.gender == "M" ? "Male" : profileData.result.response.gender == "F" ? "Female" : "";
                        let reponseObj = profileData.result.response;
                        let userDeactiveStatus = await _checkDeactiveAccess(profileData, orgAdminUserId);

                        userDetails = {
                            canDeactivate: userDeactiveStatus.canDeactivate,
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


                    }

                } else {
                    reject({ message: profileData.message });
                }

            } catch (error) {
                return reject(error);
            }
        })
    }

    /**
    * To download bulk upload user sample csv
    * @method
    * @name  bulkUploadSampleFile
    * @returns {json} Response consists sample csv data
    */

    static bulkUploadSampleFile() {
        return new Promise(async (resolve, reject) => {
            try {

                let fileInfo = {
                    sourcePath: CONSTANTS.common.SAMPLE_USERS_CSV,
                    bucket: process.env.STORAGE_BUCKET,
                    cloudStorage: process.env.CLOUD_STORAGE,
                }

                let response = await kendraService.getDownloadableUrls(fileInfo);
                resolve(response);

            } catch (error) {
                return reject(error);
            }
        })
    }

    /**
    * To get all users
    * @method
    * @name list
    * @param {Object} [queryParameter = "all"] - Filtered query data.
    * @param {Array} [fieldsArray = {}] - Projected data.   
    * @param {Object} [skipFields = "none" ]
    * @returns {Object} returns a entity types list from the filtered data.
   */

    static list(queryParameter = "all", fieldsArray = "all", skipFields = "none") {
        return new Promise(async (resolve, reject) => {
            try {

                if (queryParameter === "all") {
                    queryParameter = {};
                };
                let projection = {}

                if (fieldsArray != "all") {
                    fieldsArray.forEach(field => {
                        projection[field] = 1;
                    });
                }

                if (skipFields != "none") {
                    skipFields.forEach(element => {
                        projection[element] = 0;
                    });
                }

                let usersData =
                    await database.models.userExtension.find(queryParameter, projection).lean();

                if (!usersData) {
                    return resolve({
                        message: CONSTANTS.apiResponses.USERS_NOT_FOUND,
                    });
                }
                return resolve({ message: CONSTANTS.apiResponses.USERS_FOUND, result: usersData });

            } catch (error) {
                return reject(error);
            }
        })

    }

    /**
      * To update user data
      * @method
      * @name all
      * @param {Object} [queryParameter] - Filtered query data.
      * @param {Object} [updateObject]  - update object 
      * @returns {Object} returns the updated response
     */

    static update(queryParameter, updateObject) {
        return new Promise(async (resolve, reject) => {
            try {

                let usersData =
                    await database.models.userExtension.findOneAndUpdate(queryParameter, updateObject).lean();
                if (usersData) {
                    return resolve({ message: CONSTANTS.apiResponses.USER_UPDATED, result: usersData });
                }


            } catch (error) {
                return reject(error);
            }
        })

    }

    /**
      * To get all user roles
      * @method
      * @name getUserRoles
      * @param {String} userId - userId.
      * @returns {Object} returns the roles 
     */
    static getUserRoles(userId) {
        return new Promise(async (resolve, reject) => {
            try {

                let roles = _getUserRoles(userId);
                resolve({ result: roles, message: CONSTANTS.apiResponses.ROLES_FOUND });
            } catch (error) {
                return reject(error);
            }
        })

    }

}

/**
 * To get user roles
 * @method
 * @name _getUserRoles
 * @param {String} userId -  user id
 * @returns {json} Response consists of user roles
*/
function _getUserRoles(userId) {

    return new Promise(async (resolve, reject) => {
        try {
            let roles = [];
            let userData = await this.database.models.userExtension.findOne({ userId: userId },
                { roles: 1, organisationRoles: 1, });
            if (userData) {
                if (userData.roles) {
                    userData.roles.map(role => {
                        if (!roles.includes(role.code)) {
                            roles.push(role.code);
                        }
                    });
                }
                if (userData && userData.organisationRoles && userData.organisationRoles.length > 0) {
                    userData.organisationRoles.map(userRole => {
                        userRole.roles.map(role => {
                            if (!roles.includes(role.code)) {
                                roles.push(role.code);
                            }
                        })
                    })
                }
            }
            resolve(roles);

        } catch (error) {
            return reject(error);
        }
    })
}

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
            let projection = ["immediateChildrenEntityType"];
            let entityTypeDoc = await entityTypeHelper.list({
                _id: entityTypeId
            }, projection);

            if (entityTypeDoc.result) {
                entityTypeDoc = entityTypeDoc.result[0];
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

function _getOrganisationlist(token, userId = "") {
    return new Promise(async (resolve, reject) => {
        try {


            let roles = await _getUserRoles(userId);
            let organisationsList = [];
            let sessionOrganisationData = sessionHelpers.get(CONSTANTS.common.ORGANISATIONS_SESSION);

            if (sessionOrganisationData && sessionOrganisationData.length > 0) {
                organisationsList = sessionOrganisationData;
            } else {

                let request = {
                    "filters": {
                    }
                }

                let organisationList = await sunbirdService.searchOrganisation(request, token);
                if (organisationList && organisationList.status && organisationList.status == HTTP_STATUS_CODE.ok.status) {
                    if (organisationList.result && organisationList.result.response &&
                        organisationList.result.response && organisationList.result.response.content) {
                        await Promise.all(organisationList.result.response.content.map(async function (orgInfo) {
                            organisationsList.push({
                                label: orgInfo.orgName,
                                value: orgInfo.id
                            });
                        }));
                        sessionHelpers.set(CONSTANTS.common.ORGANISATIONS_SESSION, organisationsList);
                    }
                }

            }
            if (!roles.includes(CONSTANTS.common.PLATFROM_ADMIN_ROLE)) {
                let userOrganisations = await database.models.userExtension.findOne({ userId: userId }, { organisations: 1 });
                let organisations = [];
                if (userOrganisations && userOrganisations.organisations) {
                    userOrganisations.organisations.map(organisation => {
                        organisationsList.map(orgInfo => {

                            if (orgInfo.value == organisation.value) {
                                organisations.push(orgInfo);
                            }
                        });
                    });
                }
                resolve(organisations);
            } else {
                resolve(organisationsList);
            }
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

            if (profileRoles.includes(CONSTANTS.common.PLATFROM_ADMIN_ROLE)) {
                resolve({ canDeactivate: true })
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
                        if (element.roles.includes(CONSTANTS.common.ORG_ADMIN_ROLE)) {
                            count = count + 1;
                        }
                    }));
                    if (count == orgInfo.length) {
                        resolve({ canDeactivate: true })
                    } else {
                        resolve({ canDeactivate: false })
                    }
                } else {
                    resolve({ canDeactivate: false })
                }

            }

        } catch (err) {
            return reject(err);
        }
    });
}