/**
 * name : organisations/helper.js
 * author : Rakesh Kumar
 * Date : 19-March-2020
 * Description : All platform organisation related information.
 */

const sunbirdService =
    require(GENERIC_SERVICES_PATH + "/sunbird");
const formsHelper = require(MODULES_BASE_PATH + "/forms/helper");
const platformRolesHelper = require(MODULES_BASE_PATH + "/platformRoles/helper");
const sessionHelpers = require(GENERIC_HELPERS_PATH + "/sessions");
const rolesHelper = require(MODULES_BASE_PATH + "/roles/helper");
const usersHelper = require(MODULES_BASE_PATH + "/users/helper");


module.exports = class OrganisationsHelper {

    /**
       * Get platform organisations list.
       * @method
       * @name list
       * @param {String} token - user access token
       * @param {String} userId - user id
       * @returns {json} Response consists of organisations.
      */

    static list(token, userId) {
        return new Promise(async (resolve, reject) => {
            try {
                let organisationsList = [];
                let roles = await _getUserRoles(userId);
                if (roles.includes(CONSTANTS.common.PLATFROM_ADMIN_ROLE)) {
                    organisationsList = await _getOrganisationsDetails(token);
                } else if (roles.includes(CONSTANTS.common.ORG_ADMIN_ROLE)) {

                    let profileData = await _getProfileData(token, userId);
                    let orgList = profileData.result.response.organisations;
                    let organisationsIds = [];

                    orgList.map(orgInfo => {
                        organisationsIds.push(orgInfo.organisationId);
                    });

                    organisationsList = await _getOrganisationsDetails(token);
                    let modifiedOrganisations = [];
                    organisationsList.map(organisation => {
                        if (organisationsIds.includes(organisation.value)) {
                            modifiedOrganisations.push(organisation);
                        }
                    });
                    organisationsList = modifiedOrganisations;
                }
                if (organisationsList.length > 0) {

                    let sortedOrganisations = organisationsList.sort(UTILS.sortArrayOfObjects('label'));
                    return resolve({ data: sortedOrganisations, message: CONSTANTS.apiResponses.ORG_INFO_FETCHED });

                } else {
                    return resolve({
                        status: HTTP_STATUS_CODE["bad_request"].status,
                        message: CONSTANTS.apiResponses.NO_ORG_FOUND
                    });
                }
            } catch (error) {
                return reject(error);
            }
        })
    }

    /**
   * Get platform organisations users.
   * @method
   * @name users
   * @param {String} token - user access token
   * @param {String} userId - user id
   * @param {String} organisationId - organisation id
   * @param {String} pageSize - maximum limit 
   * @param {String} pageNo - page number
   * @param {String} searchText - search text of users
   * @param {String} status - status of the users
   * @param {Array} requestedUsers - array of selected user id
   * @returns {json} Response consists of users of organisation.
   */

    static users(token, userId, organisationId, pageSize, pageNo, searchText, status = "", requestedUsers = []) {
        return new Promise(async (resolve, reject) => {
            try {

                let response;
                let userRoles = await _getUserRoles(userId, organisationId);
                let offset = pageSize * (pageNo - 1);
                if (userRoles.includes(CONSTANTS.common.PLATFROM_ADMIN_ROLE) || userRoles.includes(CONSTANTS.common.ORG_ADMIN_ROLE)) {

                    let bodyOfRequest = {
                        organisationId: organisationId,
                    }
                    if (pageNo) {
                        bodyOfRequest['offset'] = pageNo;
                    }
                    if (pageSize) {
                        bodyOfRequest['limit'] = pageSize;
                    }
                    if (searchText) {
                        bodyOfRequest['query'] = searchText;
                    }
                    if (requestedUsers.length > 0) {
                        bodyOfRequest["id"] = requestedUsers;
                    }
                    if (status) {
                        bodyOfRequest['status'] = status;
                    }

                    let usersList =
                        await sunbirdService.users(token, bodyOfRequest);

                    if (usersList.status == HTTP_STATUS_CODE.ok.status) {

                        let userInfo = [];
                        let userIds = []
                        await Promise.all(usersList.result.content.map(async function (userItem) {
                            userIds.push(userItem.id);
                        }));

                        const fieldsArray = ["roles", "organisationRoles", "userId"];
                        const queryObject = { userId: { $in: userIds } };

                        let usersData = await usersHelper.list(queryObject, fieldsArray);

                        await Promise.all(usersList.result.content.map(async function (userItem) {

                            let rolesOfUser = "";
                            let userData = usersData.result.filter(user => {
                                if (user.userId == userItem.id) {
                                    return user;
                                }
                            });

                            let customRoles = userData[0];
                            if (customRoles && customRoles.organisationRoles) {
                                let orgRolesOfUser = [];
                                customRoles.organisationRoles.map(userRoles => {
                                    if (organisationId == userRoles.organisationId) {
                                        orgRolesOfUser.push(...userRoles.roles);
                                    }
                                })

                                let disctinctRoles = [];
                                orgRolesOfUser.map(element => {
                                    if (!disctinctRoles.includes(element.name)) {
                                        disctinctRoles.push(element.name);
                                        if (rolesOfUser == "") {
                                            rolesOfUser = element.name;
                                        } else {
                                            rolesOfUser = rolesOfUser + "," + element.name;
                                        }

                                    }
                                });
                            }

                            let gender = userItem.gender == "M" ? "Male" : userItem.gender == "F" ? "Female" : "";
                            let status = userItem.status == 1 ? "Active" : "Inactive";

                            let resultObj = {
                                firstName: userItem.firstName,
                                lastName: userItem.lastName,
                                id: userItem.id,
                                gender: gender,
                                roles: rolesOfUser,
                                status: status
                            }
                            userInfo.push(resultObj);
                        }));

                        let columns = _userColumn();
                        response = {
                            "data": {
                                count: usersList.result.count,
                                columns: columns,
                                data: userInfo
                            },
                            message: CONSTANTS.apiResponses.USERS_LIST_FETCHED,
                            success: true
                        }
                    } else {
                        throw new Error(CONSTANTS.apiResponses.USER_LIST_NOT_FOUND);
                    }

                } else {
                    throw new Error(CONSTANTS.apiResponses.INVALID_ACCESS);
                }
                return resolve(response);

            } catch (error) {
                return reject({
                    success: false,
                    message: error.message ? error.message : HTTP_STATUS_CODE["internal_server_error"].message,
                    data: false
                });
            }
        })
    }

    /**
  * Get download userList
  * @method
  * @name list
  * @param {Json} organisationUserDownloadFilters -download users filters
  * @param {String} token - user access token
  * @param {String} userId - user id
  * @returns {json} Response consists of users list.
  */

    static downloadUsers(organisationUserDownloadFilters, token, userId) {
        return new Promise(async (resolve, reject) => {
            try {

                let users = await this.users(token, userId, organisationUserDownloadFilters.organisationId,
                    organisationUserDownloadFilters.limit, organisationUserDownloadFilters.page, organisationUserDownloadFilters.searchText,
                    organisationUserDownloadFilters.status, organisationUserDownloadFilters.usersList);
                let responseData = [];
                if (users.data && users.data.data) {
                    await Promise.all(users.data.data.map(fields => {
                        if (fields.id) {
                            delete fields.id;
                        }

                        let userInfo = Object.keys(fields).reduce((c, k) => (c[UTILS.camelCaseToCapitalizeCase(k)] = fields[k], c), {})
                        responseData.push(userInfo);
                    }))
                }
                resolve(responseData);
            }
            catch (error) {
                return reject({
                    success: false,
                    message: error.message ? error.message : HTTP_STATUS_CODE["internal_server_error"].message,
                    data: false
                });
            }
        });
    }


    /**
      * To add user to organisation
      * @method
      * @name  addUser
      * @param {Object} organisationInfo  - organisation object 
      * @param {String} organisationInfo.userId - userId
      * @param {String} organisationInfo.orgnisation - organisationId
      * @param {Array} organisationInfo.roles - array of roles 
      * @param {String} token - keyclock access token
      * @returns {json} Response consists of add user details
      */
    static addUser(organisationInfo, token) {

        return new Promise(async (resolve, reject) => {
            try {
                let plaformRoles = [];
                let rolesDoc = await platformRolesHelper.getRoles();
                let sunbirdRolesDoc = await rolesHelper.list();
                let userRoles = [];
                let allRoles = {};
                if (sunbirdRolesDoc.result) {
                    sunbirdRolesDoc.result.map(function (sunbirdRole) {
                        allRoles[sunbirdRole.id] = sunbirdRole.name;
                    });
                }
                let customRoles = [];
                let rolesDocuments = [];
                if (rolesDoc && rolesDoc.result) {
                    rolesDocuments = rolesDoc.result;
                    rolesDocuments.map(function (roleDoc) {
                        customRoles[roleDoc.code] = roleDoc.title;

                    });
                }
                await Promise.all(organisationInfo.roles.map(async function (roleInfo) {
                    if (customRoles[roleInfo]) {
                        userRoles.push({ code: roleInfo, name: customRoles[roleInfo] });
                    } else if (allRoles[roleInfo]) {
                        userRoles.push({ code: roleInfo, name: allRoles[roleInfo] });
                        plaformRoles.push(roleInfo);
                    }
                }));

                if (plaformRoles.length == 0) {
                    plaformRoles.push(CONSTANTS.common.PUBLIC_ROLE);
                }
                let orgCreateRequest = {
                    organisationId: organisationInfo.organisation.value,
                    roles: plaformRoles,
                    userId: organisationInfo.userId
                }

                let addUserResponse = await sunbirdService.addUser(orgCreateRequest, token);

                if (addUserResponse && addUserResponse.status == HTTP_STATUS_CODE.ok.status) {
                    let organisationsRoles = [];
                    organisationsRoles.push({ organisationId: organisationInfo.organisation.value, roles: userRoles });
                    let queryObject = { userId: organisationInfo.userId };
                    let updateData = { $push: { organisations: organisationInfo.organisation, organisationRoles: organisationsRoles } };

                    let update = await usersHelper.update(queryObject, updateData);
                    resolve({ data: addUserResponse, message: CONSTANTS.apiResponses.USER_ADDED_TO_ORG, success: true });

                } else {
                    throw new Error(addUserResponse.message);
                }

            } catch (error) {
                return reject({
                    success: false,
                    message: error.message ? error.message : HTTP_STATUS_CODE["internal_server_error"].message,
                    data: false
                });
            }

        });
    }


    /**
    * To assign roles to organisation for a user
    * @method
    * @name  assignRoles
    * @param {Object} organisationInfo  - organisation object 
    * @param {String} organisationInfo.userId - userId
    * @param {String} organisationInfo.organisationId - organisationId
    * @param {Array} organisationInfo.roles - array of roles 
    * @param {String} token - keyclock access token
    * @returns {json} Response consists of assign role information.
    */
    static assignRoles(organisationInfo, token) {
        return new Promise(async (resolve, reject) => {
            try {
                let plaformRoles = [];
                let userRoles = [];
                if (organisationInfo.roles) {

                    let rolesDoc = await platformRolesHelper.getRoles();
                    let sunbirdRolesDoc = await rolesHelper.list();

                    let allRoles = {};
                    if (sunbirdRolesDoc.result) {
                        sunbirdRolesDoc.result.map(function (sunbirdRole) {
                            allRoles[sunbirdRole.id] = sunbirdRole.name;
                        });
                    }

                    let customRoles = [];
                    let rolesDocuments = [];
                    if (rolesDoc && rolesDoc.result) {
                        rolesDocuments = rolesDoc.result;
                        rolesDocuments.map(function (roleDoc) {
                            customRoles[roleDoc.code] = roleDoc.title;

                        });
                    }

                    await Promise.all(organisationInfo.roles.map(async function (roleInfo) {
                        if (customRoles[roleInfo]) {
                            userRoles.push({ code: roleInfo, name: customRoles[roleInfo] });
                        } else if (allRoles[roleInfo]) {
                            userRoles.push({ code: roleInfo, name: allRoles[roleInfo] });
                            plaformRoles.push(roleInfo);
                        }
                    }));
                }
                
                if (plaformRoles.length == 0) {
                    plaformRoles.push(CONSTANTS.common.PUBLIC_ROLE);
                }
                organisationInfo.roles = plaformRoles;

                let response = await sunbirdService.assignRoles(organisationInfo, token);

                if (response && response.status == HTTP_STATUS_CODE.ok.status) {
                    if (response.result == CONSTANTS.common.SUCCESS_RESPONSE) {

                        let queryObject = {
                            userId: organisationInfo.userId, "organisationRoles.organisationId": organisationInfo.organisationId
                        };
                        let updateData =
                            { "organisationRoles.$.roles": userRoles };

                        let updateUserDetails = await usersHelper.update(queryObject, updateData);
                    }

                    let message = CONSTANTS.apiResponses.ASSIGNED_ROLE_SUCCESSFULLY;
                    if (organisationInfo && organisationInfo.removeRoles) {
                        message = CONSTANTS.apiResponses.ROLES_REMOVED;
                    }
                    resolve({ data: response.result, message: message, success: true });
                } else {
                    throw new Error(response.message);
                }
            } catch (error) {
                return reject({
                    success: false,
                    message: error.message ? error.message : HTTP_STATUS_CODE["internal_server_error"].message,
                    data: false
                });
            }
        });
    }

    /**
      * To get organisation detail list.
      * @method
      * @name detailList
      * @param {Object} organisationDetails - organisation information
      * @param {String} organisationDetails.userToken - user access token
      * @param {String} organisationDetails.userId- keyclock user id
      * @param {String} organisationDetails.pageSize - page size of the request
      * @param {String} organisationDetails.pageNo - page number of the request
      * @param {String} organisationDetails.searchText - text to search in a organisations
      * @param {String} organisationDetails.status - organisation status filter
      * @returns {json} Response consists of organisations details
     */
    static detailList(organisationDetails) {
        return new Promise(async (resolve, reject) => {
            try {
                let roles = await _getUserRoles(organisationDetails.userId);
                let offset = organisationDetails.pageSize * (organisationDetails.pageNo - 1);
                if (roles.includes(CONSTANTS.common.PLATFROM_ADMIN_ROLE)) {
                    let request = {
                        "filters": {
                        },
                        "limit": organisationDetails.pageSize,
                        "offset": offset
                    }

                    if (organisationDetails.searchText) {
                        request['query'] = organisationDetails.searchText;
                    }
                    if (organisationDetails.status) {
                        request['filters']['status'] = organisationDetails.status;
                    }

                    let organisationInfo = [];
                    let organisationList = await sunbirdService.searchOrganisation(request, organisationDetails.userToken);
                    if (organisationList && organisationList.status && organisationList.status == HTTP_STATUS_CODE.ok.status) {
                        if (organisationList.result && organisationList.result.response &&
                            organisationList.result.response && organisationList.result.response.content) {
                            await Promise.all(organisationList.result.response.content.map(async function (orgInfo) {

                                let address = "";
                                if (orgInfo.address && orgInfo.address.addressLine1) {
                                    address = orgInfo.address.addressLine1
                                }
                                let orgDetails = {
                                    name: orgInfo.orgName,
                                    description: orgInfo.description,
                                    email: orgInfo.email,
                                    _id: orgInfo.id,
                                    noOfMembers: orgInfo.noOfMembers,
                                    externalId: orgInfo.externalId,
                                    status: orgInfo.status == 0 ? "Inactive" : "Active",
                                    provider: orgInfo.provider,
                                    address: address,
                                }
                                organisationInfo.push(orgDetails);
                            }));
                        }

                        let orgColumns = _organisationColumn();
                        if (organisationInfo.length > 0) {

                            let sortedOrganisations = organisationInfo.sort(UTILS.sortArrayOfObjects('organisationName'));

                            resolve({
                                data: {
                                    count: organisationList.result.response.count,
                                    columns: orgColumns,
                                    data: sortedOrganisations
                                },
                                message: CONSTANTS.apiResponses.ORG_INFO_FETCHED,
                                success: true
                            });
                        } else {
                            throw new Error(CONSTANTS.apiResponses.NO_ORG_FOUND)
                        }

                    } else {
                        throw new Error(CONSTANTS.apiResponses.NO_ORG_FOUND)
                    }
                } else {
                    throw new Error(organisationList.message);
                }
            } catch (error) {
                return reject({
                    success: false,
                    message: error.message ? error.message : HTTP_STATUS_CODE["internal_server_error"].message,
                    data: false
                });
            }
        });
    }



    /** 
  * To create organisation.
  * @method
  * @name  create
  * @param  {Object} organisationDetails - organisation details object
  * @param {String} organisationDetails.description - description for the organisation
  * @param {String} organisationDetails.externalId - externalId
  * @param {String} organisationDetails.name - name of the organisation
  * @param {String} organisationDetails.address - address of the organisation
  * @param {String} organisationDetails.email - email id
  * @param  {String} token - keyclock access token
  * @returns {json} Response consists of success or failure of the api.
  */
    static create(organisationDetails, token) {
        return new Promise(async (resolve, reject) => {
            try {

                let requestBody = {
                    "description": organisationDetails.description,
                    "externalId": organisationDetails.externalId,
                    "name": organisationDetails.name,
                    "address": organisationDetails.address,
                    "email": organisationDetails.email,
                }
                let createOrg = await sunbirdService.createOrganisation(requestBody, token);
                if (createOrg && createOrg.status == HTTP_STATUS_CODE.ok.status) {

                    let sessionOrganisationData = sessionHelpers.get(CONSTANTS.common.ORGANISATIONS_SESSION);
                    if (sessionOrganisationData) {
                        sessionOrganisationData.push({ label: organisationDetails.name, value: createOrg.result.organisationId });
                        sessionHelpers.set(CONSTANTS.common.ORGANISATIONS_SESSION, sessionOrganisationData);
                    }

                    resolve({ data: createOrg.result, message: CONSTANTS.apiResponses.ORG_CREATED, success: true });
                } else {
                    throw new Error(createOrg.message);
                }

            } catch (error) {
                return reject({
                    success: false,
                    message: error.message ? error.message : HTTP_STATUS_CODE["internal_server_error"].message,
                    data: false
                });
            }
        });
    }



    /**
   * Get get organisation creation form.
   * @method
   * @name  getForm
   * @returns {json} Response consists of organisation creation form.
   */

    static getForm() {
        return new Promise(async (resolve, reject) => {
            try {
                let formData =
                    await formsHelper.list({
                        name: "organisationCreateForm"
                    }, {
                        value: 1
                    });

                if (!formData[0]) {
                    throw new Error(CONSTANTS.apiResponses.ORG_FORM_NOT_FOUND);
                } else {
                    resolve({ data: formData[0].value, message: CONSTANTS.apiResponses.ORG_FORM_FETCHED, success: true })
                }

            } catch (error) {
                return reject({
                    success: false,
                    message: error.message ? error.message : HTTP_STATUS_CODE["internal_server_error"].message,
                    data: false
                });
            }
        });
    }


    /**
 * To update the organisational details
 * @method
 * @name  update
 * @param  {Object} organisationDetails - organisation details object
 * @param {String} organisationDetails.description - description for the organisation
 * @param {String} organisationDetails.externalId - externalId
 * @param {String} organisationDetails.name - name of the organisation
 * @param {String} organisationDetails.address - address of the organisation
 * @param {String} organisationDetails.email - email id
 * @param {String} organisationDetails.organisationId - organisation id
 * @param  {String} token - keyclock access token
 * @returns {json} Response consists of organisation updated details.
 */

    static update(organisationDetails, token) {
        return new Promise(async (resolve, reject) => {
            try {

                let requestBody = {
                    name: organisationDetails.name ? organisationDetails.name : "",
                    email: organisationDetails.email ? organisationDetails.email : "",
                    description: organisationDetails.description ? organisationDetails.description : "",
                    organisationId: organisationDetails.organisationId,
                    address: organisationDetails.address
                }
                if (organisationDetails.externalId) {
                    requestBody['externalId'] = organisationDetails.externalId;
                }

                let updateOrg = await sunbirdService.updateOrganisationDetails(requestBody, token);
                if (updateOrg && updateOrg.status == HTTP_STATUS_CODE.ok.status) {
                    resolve({ data: updateOrg.result, message: CONSTANTS.apiResponses.ORG_UPDATED, success: true });
                } else {
                    throw new Error(updateOrg.message);
                }

            } catch (error) {
                return reject({
                    success: false,
                    message: error.message ? error.message : HTTP_STATUS_CODE["internal_server_error"].message,
                    data: false
                });
            }
        });
    }


    /**
   * To get the organisational details
   * @method
   * @name  details
   * @param  {String} organisationId - organisation id
   * @param  {String} token - keyclock access token
   * @returns {json} Response consists oforganisation details
   */

    static details(organisationId, token) {
        return new Promise(async (resolve, reject) => {
            try {

                let orgDetails = await sunbirdService.getOrganisationDetails({ organisationId: organisationId }, token);
                if (orgDetails && orgDetails.status == HTTP_STATUS_CODE.ok.status) {
                    let response = orgDetails.result;
                    let address = "";
                    if (response.address && response.address.addressLine1) {
                        address = response.address.addressLine1
                    }

                    let responseObj = {
                        organisationId: response.organisationId,
                        status: response.status == 1 ? "Active" : "Inactive",
                        provider: response.provider,
                        name: response.orgName,
                        email: response.email,
                        externalId: response.externalId,
                        noOfMembers: response.noOfMembers,
                        description: response.description,
                        channel: response.channel,
                        updatedDate: response.updatedDate,
                        createdDate: response.createdDate,
                        address: address
                    }

                    resolve({ data: responseObj, message: CONSTANTS.apiResponses.ORG_DETAILS_FOUND, success: true });
                } else {
                    throw new Error(orgDetails.message);
                }

            } catch (error) {
                return reject({
                    success: false,
                    message: error.message ? error.message : HTTP_STATUS_CODE["internal_server_error"].message,
                    data: false
                });
            }
        });
    }


    /**
    * To\update organisation status
    * @method
    * @name  updateStatus
    * @param {Object} organisationDetails - organisation details object
    * @param {String} organisationDetails.organisationId - organisation id
    * @param {String} organisationDetails.status - status code
    * @param  {token} token  - keyclock access token
    * @returns {json} Response consists of organisation update status info
    */

    static updateStatus(organisationDetails, token) {
        return new Promise(async (resolve, reject) => {
            try {

                let updateOrg = await sunbirdService.updateOrgStatus(organisationDetails, token);
                if (updateOrg && updateOrg.status == HTTP_STATUS_CODE.ok.status) {

                    let msg = CONSTANTS.apiResponses.ORG_ACTIVATED;
                    if (organisationDetails.status == 0) {
                        msg = CONSTANTS.apiResponses.ORG_DEACTIVATED;
                    }
                    resolve({ data: updateOrg.result, message: msg, success: true });
                } else {
                    throw new Error(updateOrg.message);
                }

            } catch (error) {
                return reject({
                    success: false,
                    message: error.message ? error.message : HTTP_STATUS_CODE["internal_server_error"].message,
                    data: false
                });
            }
        });
    }

    /**
    * remove user from the organisation
    * @method
    * @name  removeUser
    * @param {Object} organisationDetails - organisation user details 
    * @param {String} organisationDetails.organisationId - organisation id
    * @param {String} organisationDetails.userId - keyclock user id
    * @param  {token} token  - user access token
    * @returns {json} Response consists of organisation removed user info
    */

    static removeUser(organisationDetails, token) {
        return new Promise(async (resolve, reject) => {
            try {

                let removeUser = await sunbirdService.removeUser(organisationDetails, token);
                if (removeUser && removeUser.status == HTTP_STATUS_CODE.ok.status) {

                    let queryObject = { userId: organisationDetails.userId };
                    let updateData = {
                        $pull: {
                            organisations: { value: organisationDetails.organisationId },
                            organisationRoles: {
                                organisationId: organisationDetails.organisationId
                            }
                        }
                    }
                    let updateUserDetails = await usersHelper.update(queryObject, updateData);
                    resolve({ data: removeUser.result, message: CONSTANTS.apiResponses.USER_REMOVED, success: true });
                } else {
                    throw new Error(removeUser.message);
                }

            } catch (error) {
                return reject({
                    success: false,
                    message: error.message ? error.message : HTTP_STATUS_CODE["internal_server_error"].message,
                    data: false
                });
            }
        });
    }

};


/**
   * check the user has permission for Org odmin or user admin
   * @method
   * @name _getUserRoles
   * @param {String} userId -  user id
   * @param  {String} organisationId  - organisation id 
   * @returns {json} Response consists of user roles
*/
function _getUserRoles(userId, organisationId = "") {

    return new Promise(async (resolve, reject) => {
        try {

            let roles = await usersHelper.getUserRoles(userId, organisationId);
            if (roles && roles.result) {
                resolve(roles.result);
            } else {
                roles = [];
                resolve(roles);
            }
        } catch (error) {
            return reject(error);
        }
    })






}

/**
   * 
   * @method
   * @name _userColumn
   * @returns {json} - User columns data
*/

function _userColumn() {

    let columns = [
        'select',
        'firstName',
        'lastName',
        'gender',
        'roles',
        'status',
        'actions'
    ];

    let defaultColumn = {
        "type": "column",
        "visible": true
    }

    let result = [];

    for (let column = 0; column < columns.length; column++) {
        let obj = { ...defaultColumn };
        let field = columns[column];

        obj["label"] = UTILS.camelCaseToCapitalizeCase(field);
        obj["key"] = field

        if (field === "actions") {
            obj["type"] = "action";
            obj["actions"] = _actions();
        } else if (field === "select") {
            obj['type'] = "checkbox";
            obj["key"] = "id";
        }

        result.push(obj);

    }
    return result;
}

/**
   * User columns action data.
   * @method
   * @name _actions 
   * @returns {json}
*/

function _actions() {

    let actions = ["view", "edit"];
    let actionsColumn = [];

    for (let action = 0; action < actions.length; action++) {
        actionsColumn.push({
            key: actions[action],
            label: UTILS.camelCaseToCapitalizeCase(actions[action]),
            visible: true,
            icon: actions[action]
        })
    }

    return actionsColumn;
}

/**
   * To get Organisation Details By Id.
   * @method
   * @name _getOrganisationsDetails
   * @param {String} token - user access token
   * @returns {json} - returns organisational details
*/

function _getOrganisationsDetails(token) {

    return new Promise(async (resolve, reject) => {

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
            if (organisationList.status == HTTP_STATUS_CODE.ok.status) {
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
        resolve(organisationsList);
    });

}

/**
 * to get _getProfileData of user
 * @method
 * @name _getProfileData
 * @param {String} userId - user id 
 * @param {String} token - user access token
 * @returns {json} Response consists of profile data
*/

function _getProfileData(token, userId) {
    return new Promise(async (resolve, reject) => {
        try {
            let profileData =
                await sunbirdService.getUserProfileInfo(token, userId);

            return resolve(profileData);

        } catch (error) {
            return reject(error);
        }
    });
}


/**
   * 
   * @method
   * @name _organisationColumn
   * @returns {json} - organisation columns data
*/

function _organisationColumn() {

    let columns = [
        'select',
        'name',
        'description',
        'externalId',
        'address',
        'status',
        'actions'
    ];

    let defaultColumn = {
        "type": "column",
        "visible": true
    }

    let result = [];

    for (let column = 0; column < columns.length; column++) {
        let obj = { ...defaultColumn };
        let field = columns[column];

        obj["label"] = UTILS.camelCaseToCapitalizeCase(field);
        obj["key"] = field

        if (field === "actions") {
            obj["type"] = "action";
            obj["actions"] = _actions();
        } else if (field === "select") {
            obj["key"] = "id";
            obj["visible"] = false;

        }

        result.push(obj);

    }
    return result;
}
