/**
 * name : sunbird.js
 * author : Rakesh Kumar
 * Date : 18-march-2020
 * Description : All sunbird service related information.
 */

//dependencies

const request = require('request');

/**
  * To get organisation details
  * @function
  * @name organisationList
  * @param token - Logged in user token.
  * @returns {Json} - Returns organisation list details
*/

const organisationList = async function (token) {
    return new Promise(async (resolve, reject) => {

        const createUserUrl =
            process.env.sunbird_url + constants.endpoints.SUNBIRD_ORGANISATION_LIST;

        let options = {
            "headers": {
                "content-type": "application/json",
                "authorization": process.env.AUTHORIZATION,
                "x-authenticated-user-token": token
            }
        };

        request.get(createUserUrl, options, callback);

        function callback(err, data) {
            if (err) {
                return reject({
                    message: constants.apiResponses.SUNBIRD_SERVICE_DOWN
                });
            } else {
                return resolve(data.body);
            }
        }
    })
}

/**
  * Get the user profile information.
  * @function
  * @name getUserProfileInfo
  * @param userId - Logged in user Id.
  * @param token - Logged in user token.
  * @returns {JSON} - user profile information.
*/

const getUserProfileInfo = function (token, userId) {
    return new Promise(async (resolve, reject) => {

        const createUserUrl =
            process.env.sunbird_url + constants.endpoints.SUNBIRD_USER_READ + "/"
            + userId + "?fields=completeness,missingFields,lastLoginTime";
        let options = {
            "headers": {
                "content-type": "application/json",
                "authorization": process.env.AUTHORIZATION,
                "x-authenticated-user-token": token
            }

        };

        request.get(createUserUrl, options, callback);
        function callback(err, data) {
            if (err) {
                return reject({
                    message: constants.apiResponses.SUNBIRD_SERVICE_DOWN
                });
            } else {
                return resolve(data.body);
            }
        }
    })
}

/**
  * Get users.
  * @function
  * @name users
  * @param body - body data.
  * @param token - Logged in user token.
  * @returns {JSON} - All users data.
*/

const users = function (token, body) {
    return new Promise(async (resolve, reject) => {

        const userSearchAPI =
            process.env.sunbird_url + constants.endpoints.SUNBIRD_SEARCH_USER;

        let options = {
            "headers": {
                "content-type": "application/json",
                "authorization": process.env.AUTHORIZATION,
                "x-authenticated-user-token": token,
            },
            json: body
        };

        request.post(userSearchAPI, options, callback);

        function callback(err, data) {
            if (err) {
                return reject({
                    message: constants.apiResponses.SUNBIRD_SERVICE_DOWN
                });
            } else {
                return resolve(data.body);
            }
        }
    })
}

/**
  * To add user to organisation.
  * @function
  * @name addUser
  * @param userInfo - user information.
  * @param token - Logged in user token.
  * @returns {JSON} - add user details
*/

const addUser = function (userInfo, token) {
    return new Promise(async (resolve, reject) => {

        const adduserToOrgUrl =
            process.env.sunbird_url + constants.endpoints.SUNBIRD_ADD_USER_TO_ORG;
        let response = await callToSunbird(token, userInfo, adduserToOrgUrl);
        return resolve(response);

    })
}

/**
  * To assign roles to user for a organisation.
  * @function
  * @name assignRoles
  * @param rolesInfo - roles info organisation.
  * @param token - Logged in user token.
  * @returns {JSON} - All users data.
*/

const assignRoles = function (rolesInfo, token) {
    return new Promise(async (resolve, reject) => {

        const assignRolesToOrgApiUrl =
            process.env.sunbird_url + constants.endpoints.SUNBIRD_ASSIGN_ROLES_TO_ORG;

        let response = await callToSunbird(token, rolesInfo, assignRolesToOrgApiUrl);
        return resolve(response);


    })
}


/**
  * Call to sunbird api`s. 
  * @function
  * @name callToSunbird
  * @param requestBody - Logged in user Id.
  * @param token - Logged in user token.
  * @param url - url of the api call.
  * @param type - request type of the api call
  * @returns {JSON} - return response from the sunbird api.
*/

function callToSunbird(token, requestBody, url, type = "") {

    return new Promise(async (resolve, reject) => {
        let options = {
            "headers": {
                "content-type": "application/json",
                "authorization": process.env.AUTHORIZATION,
                "x-authenticated-user-token": token
            },
            json: { request: requestBody }

        };

        if (type == "PATCH") {
            request.patch(url, options, callback);
        } else {
            request.post(url, options, callback);
        }

        function callback(err, data) {

            if (err) {
                return reject({
                    message: constants.apiResponses.SUNBIRD_SERVICE_DOWN
                });
            } else {

                return resolve(data.body);
            }
        }

    });
}


/**
  * To search the organisation 
  * @function
  * @name searchOrganisation
  * @param searchDetails - search details.
  * @param token - Logged in user token.
  * @returns {JSON} - All users data.
*/

const searchOrganisation = function (searchDetails, token) {
    return new Promise(async (resolve, reject) => {

        const searchOrgUrl =
            process.env.sunbird_url + constants.endpoints.SUNBIRD_SEARCH_ORG;
        let response = await callToSunbird(token, searchDetails, searchOrgUrl);
        return resolve(response);

    })
}

/**
  * For creating organisation
  * @function
  * @name createOrganisation
  * @param organisationDetails - organisation details.
  * @param token - Logged in user token.
  * @returns {JSON} - All users data.
*/

const createOrganisation = function (organisationDetails, token) {
    return new Promise(async (resolve, reject) => {

        const searchOrgUrl =
            process.env.sunbird_url + constants.endpoints.SUNBIRD_CREATE_ORG;
        let response = await callToSunbird(token, organisationDetails, searchOrgUrl);
        return resolve(response);

    })
}


/**
  * For updating organisation details
  * @function
  * @name updateOrganisationDetails
  * @param organisationDetails - organisation details .
  * @param token - Logged in user token.
  * @returns {JSON} - return updated organisation details
*/
const updateOrganisationDetails = function (organisationDetails, token) {
    return new Promise(async (resolve, reject) => {

        const updateOrgDetails =
            process.env.sunbird_url + constants.endpoints.SUNBIRD_UPDATE_ORG;
        let response = await callToSunbird(token, organisationDetails, updateOrgDetails, "PATCH");
        return resolve(response);


    })
}

/**
  * To get organisational details
  * @function
  * @name getOrganisationDetails
  * @param organisationDetails - organisation details .
  * @param token - Logged in user token.
  * @returns {JSON} - return updated organisation details
*/
const getOrganisationDetails = function (requestBody, token) {
    return new Promise(async (resolve, reject) => {

        const OrgDetails =
            process.env.sunbird_url + constants.endpoints.SUNBIRD_READ_ORG;
        let response = await callToSunbird(token, requestBody, OrgDetails);
        return resolve(response);


    })
}

/**
  * For updating organisation status
  * @function
  * @name updateOrgStatus
  * @param organisationDetails - organisation details .
  * @param token - Logged in user token.
  * @returns {JSON} - return updated organisation status
*/
const updateOrgStatus = function (organisationDetails, token) {
    return new Promise(async (resolve, reject) => {

        const OrgDetails =
            process.env.sunbird_url + constants.endpoints.SUNBIRD_ORG_STATUS_UPDATE;
        let response = await callToSunbird(token, organisationDetails, OrgDetails, "PATCH");
        return resolve(response);
    })
}

/**
  * For remove user from the organisation
  * @function
  * @name removeUser
  * @param userDetails - organisation details .
  * @param token - Logged in user token.
  * @returns {JSON} - response consist of removed user details
*/
const removeUser = function (userDetails, token) {
    return new Promise(async (resolve, reject) => {

        const userRemoveApi =
            process.env.sunbird_url + constants.endpoints.SUNBIRD_REMOVE_USER_FROM_ORG;
        let response = await callToSunbird(token, userDetails, userRemoveApi);
        return resolve(response);

    })
}

module.exports = {
    organisationList: organisationList,
    getUserProfileInfo: getUserProfileInfo,
    users: users,
    addUser: addUser,
    assignRoles: assignRoles,
    searchOrganisation: searchOrganisation,
    createOrganisation: createOrganisation,
    updateOrganisationDetails: updateOrganisationDetails,
    getOrganisationDetails: getOrganisationDetails,
    updateOrgStatus: updateOrgStatus,
    removeUser: removeUser
};