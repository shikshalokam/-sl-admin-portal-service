/**
 * name : sunbird.js
 * author : Rakesh Kumar
 * Date : 18-march-2020
 * Description : All sunbird service related information.
 */

//dependencies

const request = require('request');

/**
  * create user
  * @function
  * @name createUser
  * @param token - Logged in user token.
  * @returns {Promise}
*/

var organisationList = async function (token) {

    const createUserUrl =
        process.env.sunbird_url + constants.endpoints.SUNBIRD_ORGANISATION_LIST;

    return new Promise(async (resolve, reject) => {

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

var getUserProfileInfo = function (token, userId) {
    const createUserUrl =
        process.env.sunbird_url + constants.endpoints.SUNBIRD_USER_READ + "/" + userId + "?fields=completeness,missingFields,lastLoginTime";


    return new Promise(async (resolve, reject) => {

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

var users = function (token, body) {
    const userSearchAPI =
        process.env.sunbird_url + constants.endpoints.SUNBIRD_SEARCH_USER


    return new Promise(async (resolve, reject) => {

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
  * to add user to organisation.
  * @function
  * @name addUser
  * @param requestBody - requestBody .
  * @param token - Logged in user token.
  * @returns {JSON} - All users data.
*/

var addUser = function (requestBody, token) {



    return new Promise(async (resolve, reject) => {

        const adduserToOrgUrl =
            process.env.sunbird_url + constants.endpoints.SUNBIRD_ADD_USER_TO_ORG;
        let response = await callToSunbird(token, requestBody, adduserToOrgUrl);
        return resolve(response);


    })
}

/**
  * to add user to organisation.
  * @function
  * @name addUser
  * @param requestBody - requestBody .
  * @param token - Logged in user token.
  * @returns {JSON} - All users data.
*/

var assignRoles = function (requestBody, token) {
    return new Promise(async (resolve, reject) => {

        const assignRolesToOrgApiUrl =
            process.env.sunbird_url + constants.endpoints.SUNBIRD_ASSIGN_ROLES_TO_ORG;

        let response = await callToSunbird(token, requestBody, assignRolesToOrgApiUrl);
        return resolve(response);


    })
}


/**
  * call To Sunbird Apis. 
  * @function
  * @name getUserProfileInfo
  * @param requestBody - Logged in user Id.
  * @param token - Logged in user token.
  * @param url - url of the api call.
  * @returns {JSON} - user profile information.
*/

function callToSunbird(token, requestBody, url) {

    return new Promise(async (resolve, reject) => {
        let options = {
            "headers": {
                "content-type": "application/json",
                "authorization": process.env.AUTHORIZATION,
                "x-authenticated-user-token": token
            },
            json: { request: requestBody }


        };

        request.post(url, options, callback);
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
  * to search the organisation 
  * @function
  * @name searchOrganisation
  * @param requestBody - requestBody .
  * @param token - Logged in user token.
  * @returns {JSON} - All users data.
*/

var searchOrganisation = function (requestBody, token) {
    return new Promise(async (resolve, reject) => {

        const searchOrgUrl =
            process.env.sunbird_url + constants.endpoints.SUNBIRD_SEARCH_ORG;
        let response = await callToSunbird(token, requestBody, searchOrgUrl);
        return resolve(response);


    })
}

module.exports = {
    organisationList: organisationList,
    getUserProfileInfo: getUserProfileInfo,
    users: users,
    addUser: addUser,
    assignRoles: assignRoles,
    searchOrganisation:searchOrganisation
};