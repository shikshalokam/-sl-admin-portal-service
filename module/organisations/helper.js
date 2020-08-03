/**
 * name : organisations/helper.js
 * author : Rakesh Kumar
 * Date : 19-March-2020
 * Description : All platform organisation related information.
 */

const sunbirdService =
    require(SERVICES_PATH + "/sunbird");
const formsHelper = require(MODULES_BASE_PATH + "/forms/helper");
const platformRolesHelper = require(MODULES_BASE_PATH + "/platformRoles/helper");
const sessionHelpers = require(ROOT_PATH + "/generics/helpers/sessions");
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
                if (roles.includes(constants.common.PLATFROM_ADMIN_ROLE)) {
                    organisationsList = await _getOrganisationsDetails(token);
                } else if (roles.includes(constants.common.ORG_ADMIN_ROLE)) {

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

                    let sortedOrganisations = organisationsList.sort(gen.utils.sortArrayOfObjects('label'));
                    return resolve({ result: sortedOrganisations, message: constants.apiResponses.ORG_INFO_FETCHED });

                } else {
                    return resolve({
                        status: httpStatusCode["bad_request"].status,
                        message: constants.apiResponses.NO_ORG_FOUND
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
                if (userRoles.includes(constants.common.PLATFROM_ADMIN_ROLE) || userRoles.includes(constants.common.ORG_ADMIN_ROLE)) {

                    let bodyOfRequest = {
                        "request": {
                            "filters": {
                                "organisations.organisationId": organisationId,
                            }
                        }
                    }

                    if (pageNo) {
                        bodyOfRequest.request['offset'] = offset;
                    }
                    if (pageSize) {
                        bodyOfRequest.request['limit'] = pageSize;
                    }
                    if (searchText) {
                        bodyOfRequest.request['query'] = searchText;
                    }
                    if (requestedUsers.length > 0) {
                        bodyOfRequest.request['filters']["id"] = requestedUsers;
                    }
                    if (status) {
                        bodyOfRequest.request['filters']['status'] = status;
                    }

                    let usersList =
                        await sunbirdService.users(token, bodyOfRequest);

                    if (usersList.responseCode == constants.common.RESPONSE_OK) {

                        let userInfo = [];
                        let userIds = []
                        await Promise.all(usersList.result.response.content.map(async function (userItem) {
                            userIds.push(userItem.id);
                        }));

                        const fieldsArray = ["roles", "organisationRoles", "userId"];
                        const queryObject = { userId: { $in: userIds } };

                        let usersData = await usersHelper.list(queryObject, fieldsArray);

                        await Promise.all(usersList.result.response.content.map(async function (userItem) {

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
                            "result": {
                                count: usersList.result.response.count,
                                columns: columns,
                                data: userInfo
                            },
                            message: constants.apiResponses.USERS_LIST_FETCHED
                        }
                    } else {
                        response = {
                            status: httpStatusCode["bad_request"].status,
                            message: constants.apiResponses.USER_LIST_NOT_FOUND
                        };
                    }

                } else {
                    response = {
                        status: httpStatusCode["bad_request"].status,
                        message: constants.apiResponses.INVALID_ACCESS
                    }
                }
                return resolve(response);

            } catch (error) {
                return reject(error);
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
                if (users.result && users.result.data) {
                    await Promise.all(users.result.data.map(fields => {
                        if (fields.id) {
                            delete fields.id;
                        }

                        let userInfo = Object.keys(fields).reduce((c, k) => (c[gen.utils.camelCaseToCapitalizeCase(k)] = fields[k], c), {})
                        responseData.push(userInfo);
                    }))
                }
                resolve(responseData);
            }
            catch (error) {
                return reject(error);
            }
        });
    }



    /**
    * To add user to organisation
    * @method
    * @name  addUser
    * @param  {organisationInfo,token}  - organisation object and token
    * @returns {json} Response consists of success or failure of the api.
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
                // organisationInfo/

                await Promise.all(organisationInfo.roles.map(async function (roleInfo) {
                    if (customRoles[roleInfo]) {
                        userRoles.push({ code: roleInfo, name: customRoles[roleInfo] });
                    } else if (allRoles[roleInfo]) {
                        userRoles.push({ code: roleInfo, name: allRoles[roleInfo] });
                        plaformRoles.push(roleInfo);
                    }
                }));

                if (plaformRoles.length == 0) {
                    plaformRoles.push(constants.common.PUBLIC_ROLE);
                }
                let orgCreateRequest = {
                    organisationId: organisationInfo.organisation.value,
                    roles: plaformRoles,
                    userId: organisationInfo.userId
                }

                let response = await sunbirdService.addUser(orgCreateRequest, token);

                if (response && response.responseCode == constants.common.RESPONSE_OK) {
                    if (response.result.response == constants.common.SUCCESS_RESPONSE) {
                        let organisationsRoles = [];
                        organisationsRoles.push({ organisationId: organisationInfo.organisation.value, roles: userRoles });

                        let queryObject = { userId: organisationInfo.userId };
                        let updateData = { $push: { organisations: organisationInfo.organisation, organisationRoles: organisationsRoles } };

                        let update = await usersHelper.update(queryObject, updateData);
                        resolve({ result: response.result, message: constants.apiResponses.USER_ADDED_TO_ORG });
                    } else {

                        if (response.result.response) {
                            reject({
                                result: response.result, status: httpStatusCode["bad_request"].status,
                                message: response.result.response
                            });
                        } else {

                            reject({
                                result: response.result, status: httpStatusCode["bad_request"].status,
                                message: constants.apiResponses.FAILED_TO_ADD_USER_TO_ORG
                            });

                        }


                    }

                } else {
                    reject({ message: response.params.errmsg, status: httpStatusCode["bad_request"].status });
                }

            } catch (error) {
                return reject(error)
            }

        });
    }



    /**
     * To assign roles to organisation for a user
     * @method
     * @name  assignRoles
     * @param  {orgnisationInfo,token}  - organisation object and token
     * @returns {json} Response consists of assign role information.
     */
    static assignRoles(orgnisationInfo, token) {
        return new Promise(async (resolve, reject) => {
            try {
                let plaformRoles = [];
               let userRoles = [];
                if (orgnisationInfo.roles) {

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

                    await Promise.all(orgnisationInfo.roles.map(async function (roleInfo) {
                        if (customRoles[roleInfo]) {
                            userRoles.push({ code: roleInfo, name: customRoles[roleInfo] });
                        } else if (allRoles[roleInfo]) {
                            userRoles.push({ code: roleInfo, name: allRoles[roleInfo] });
                            plaformRoles.push(roleInfo);
                        }
                    }));
                }

                if (plaformRoles.length == 0) {
                    plaformRoles.push(constants.common.PUBLIC_ROLE);
                }
                orgnisationInfo.roles = plaformRoles;

                let response = await sunbirdService.assignRoles(orgnisationInfo, token);
                if (response && response.responseCode == constants.common.RESPONSE_OK) {
                    if (response.result.response == constants.common.SUCCESS_RESPONSE) {

                        let queryObject = {
                            userId: orgnisationInfo.userId, "organisationRoles.organisationId": orgnisationInfo.organisationId
                        };
                        let updateData =
                            { "organisationRoles.$.roles": userRoles };

                        let updateUserDetails = await usersHelper.update(queryObject, updateData);
                    }

                    let message = constants.apiResponses.ASSIGNED_ROLE_SUCCESSFULLY;
                    if (orgnisationInfo && orgnisationInfo.removeRoles) {
                        message = constants.apiResponses.ROLES_REMOVED;
                    }
                    resolve({ result: response.result, message: message });
                } else {
                    reject({ message: response.params.errmsg });
                }
            } catch (error) {
                return reject(error)
            }
        });
    }

    /**
     * To get organisation detail list.
     * @method
     * @name  detailList
     * @param  {inputData}  - hold query object
     * @returns {json} Response consists of success or failure of the api.
     */
    static detailList(inputData) {
        return new Promise(async (resolve, reject) => {
            try {
                let roles = await _getUserRoles(inputData.userId);
                let offset = inputData.pageSize * (inputData.pageNo - 1);
                if (roles.includes(constants.common.PLATFROM_ADMIN_ROLE)) {
                    let request = {
                        "filters": {
                        },
                        "limit": inputData.pageSize,
                        "offset": offset
                    }

                    if (inputData.searchText) {
                        request['query'] = inputData.searchText;
                    }
                    if (inputData.status) {
                        request['filters']['status'] = inputData.status;
                    }

                    let organisationInfo = [];
                    let organisationList = await sunbirdService.searchOrganisation(request, inputData.userToken);
                    if (organisationList.responseCode == constants.common.RESPONSE_OK) {
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

                            let sortedOrganisations = organisationInfo.sort(gen.utils.sortArrayOfObjects('organisationName'));

                            resolve({
                                result: {
                                    count: organisationList.result.response.count,
                                    columns: orgColumns,
                                    data: sortedOrganisations
                                },
                                message: constants.apiResponses.ORG_INFO_FETCHED
                            });
                        } else {
                            resolve({
                                result: {
                                    count: 0,
                                    columns: orgColumns,
                                    data: []
                                }, message: constants.apiResponses.NO_ORG_FOUND
                            })
                        }

                    } else {
                        resolve({ result: organisationList, message: constants.apiResponses.NO_ORG_FOUND })
                    }
                } else {
                    reject({
                        status: httpStatusCode["bad_request"].status,
                        message: constants.apiResponses.INVALID_ACCESS
                    })
                }
            } catch (error) {
                return reject(error)
            }
        });
    }



    /** 
    * To create organisation.
    * @method
    * @name  create
    * @param  {Json} inputData - hold query object
    * @param  {String} token - user access token
    * @returns {json} Response consists of success or failure of the api.
    */
    static create(inputData, token) {
        return new Promise(async (resolve, reject) => {
            try {

                let requestBody = {
                    "channel": process.env.SUNBIRD_CHANNEL,
                    "description": inputData.description,
                    "externalId": inputData.externalId,
                    "provider": process.env.SUNBIRD_PROVIDER,
                    "orgName": inputData.name,
                    "address": {
                        addressLine1: inputData.address,
                        city: inputData.address
                    },
                    "email": inputData.email,
                }
                let createOrg = await sunbirdService.createOrganisation(requestBody, token);
                if (createOrg && createOrg.responseCode == constants.common.RESPONSE_OK) {

                    let sessionOrganisationData = sessionHelpers.get(constants.common.ORGANISATIONS_SESSION);
                    if (sessionOrganisationData) {
                        sessionOrganisationData.push({ label: inputData.name, value: createOrg.result.organisationId });
                        sessionHelpers.set(constants.common.ORGANISATIONS_SESSION, sessionOrganisationData);
                    }

                    resolve({ result: createOrg.result, message: constants.apiResponses.ORG_CREATED });
                } else {
                    reject({ message: createOrg.params.errmsg });
                }

            } catch (error) {
                return reject(error)
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
                    return resolve({
                        status: httpStatusCode["bad_request"].status,
                        message:
                            constants.apiResponses.ORG_FORM_NOT_FOUND
                    });
                } else {
                    resolve({ result: formData[0].value, message: constants.apiResponses.ORG_FORM_FETCHED })
                }

            } catch (error) {
                return reject(error)
            }
        });
    }

    /**
    * To update the organisational details
    * @method
    * @name  update
    * @returns {json} Response consists of organisation creation form.
    */

    static update(inputData, token) {
        return new Promise(async (resolve, reject) => {
            try {

                let requestBody = {
                    orgName: inputData.name ? inputData.name : "",
                    email: inputData.email ? inputData.email : "",
                    description: inputData.description ? inputData.description : "",
                    organisationId: inputData.organisationId,
                    address: {
                        addressLine1: inputData.address,
                        city: inputData.address
                    }
                }
                if (inputData.externalId) {
                    requestBody['externalId'] = inputData.externalId;
                    requestBody['provider'] = process.env.SUNBIRD_PROVIDER;
                }

                let updateOrg = await sunbirdService.updateOrganisationDetails(requestBody, token);
                if (updateOrg && updateOrg.responseCode == constants.common.RESPONSE_OK) {
                    resolve({ result: updateOrg.result, message: constants.apiResponses.ORG_UPDATED });
                } else {
                    reject({ message: updateOrg.params.errmsg });
                }

            } catch (error) {
                return reject(error)
            }
        });
    }


    /**
    * To get the organisational details
    * @method
    * @name  details
    * @returns {json} Response consists of organisation creation form.
    */

    static details(organisationId, token) {
        return new Promise(async (resolve, reject) => {
            try {

                let orgDetails = await sunbirdService.getOrganisationDetails({ organisationId: organisationId }, token);
                if (orgDetails && orgDetails.responseCode == constants.common.RESPONSE_OK) {
                    let response = orgDetails.result.response;
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

                    resolve({ result: responseObj, message: constants.apiResponses.ORG_DETAILS_FOUND });
                } else {
                    reject({ message: orgDetails.params.errmsg });
                }

            } catch (error) {
                return reject(error)
            }
        });
    }


    /**
    * To\update organisation status
    * @method
    * @name  updateStatus
    * @param {Json} inputData -  organisation details
    * @param  {token} token  - user access token
    * @returns {json} Response consists of organisation creation form.
    */

    static updateStatus(inputData, token) {
        return new Promise(async (resolve, reject) => {
            try {

                let updateOrg = await sunbirdService.updateOrgStatus(inputData, token);
                if (updateOrg && updateOrg.responseCode == constants.common.RESPONSE_OK) {

                    let msg = constants.apiResponses.ORG_ACTIVATED;
                    if (inputData.status == 0) {
                        msg = constants.apiResponses.ORG_DEACTIVATED;
                    }
                    resolve({ result: updateOrg.result, message: msg });
                } else {
                    reject({ message: updateOrg });
                }

            } catch (error) {
                return reject(error)
            }
        });
    }

    /**
    * remove user from the organisation
    * @method
    * @name  removeUser
    * @param {Json} inputData -  organisation user details
    * @param  {token} token  - user access token
    * @returns {json} Response consists of organisation creation form.
    */

    static removeUser(inputData, token) {
        return new Promise(async (resolve, reject) => {
            try {

                let removeUser = await sunbirdService.removeUser(inputData, token);
                if (removeUser && removeUser.responseCode == constants.common.RESPONSE_OK) {

                    if (removeUser.result.response == constants.common.SUCCESS_RESPONSE) {

                        let queryObject = { userId: inputData.userId };
                        let updateData = {
                            $pull: {
                                organisations: { value: inputData.organisationId },
                                organisationRoles: {
                                    organisationId: inputData.organisationId
                                }
                            }
                        }
                        let updateUserDetails = await usersHelper.update(queryObject, updateData);

                    }
                    resolve({ result: removeUser.result, message: constants.apiResponses.USER_REMOVED });
                } else {
                    reject({ message: removeUser });
                }

            } catch (error) {
                return reject(error)
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

            let  roles = await usersHelper.getUserRoles(userId, organisationId);
            if(roles && roles.result){
                resolve(roles.result);
            }else{
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

        obj["label"] = gen.utils.camelCaseToCapitalizeCase(field);
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
            label: gen.utils.camelCaseToCapitalizeCase(actions[action]),
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
        let sessionOrganisationData = sessionHelpers.get(constants.common.ORGANISATIONS_SESSION);

        if (sessionOrganisationData && sessionOrganisationData.length > 0) {
            organisationsList = sessionOrganisationData;
        } else {

            let request = {
                "filters": {
                }
            }

            let organisationList = await sunbirdService.searchOrganisation(request, token);
            if (organisationList.responseCode == constants.common.RESPONSE_OK) {
                if (organisationList.result && organisationList.result.response &&
                    organisationList.result.response && organisationList.result.response.content) {
                    await Promise.all(organisationList.result.response.content.map(async function (orgInfo) {
                        organisationsList.push({
                            label: orgInfo.orgName,
                            value: orgInfo.id
                        });
                    }));
                    sessionHelpers.set(constants.common.ORGANISATIONS_SESSION, organisationsList);
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

        obj["label"] = gen.utils.camelCaseToCapitalizeCase(field);
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
