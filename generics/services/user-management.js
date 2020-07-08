/**
 * name : user-management.js
 * author : Rakesh Kumar
 * Date : 17-March-2020
 * Description : All user management related api call.
 */

//dependencies

const apiBaseUrl =
    process.env.USER_MANAGEMENT_HOST +
    process.env.USER_MANAGEMENT_BASE_URL +
    process.env.URL_PREFIX;

const request = require('request');

/**
  * Get platform user roles
  * @function
  * @name platformUserProfile
  * @param userId - user id of keyclock
  * @param token - logged in user token
  * @returns {Json} returns a platform user profile info.
*/

const platformUserProfile = function (userId, token) {
    return new Promise(async (resolve, reject) => {
        try {

            let platformUserRolesUrl =
                apiBaseUrl + constants.endpoints.PLATFORM_USER_PROFILE + "/" + userId;
            let requestBody = {}
            let userManagementData = await httpCall(platformUserRolesUrl, token, requestBody, "GET");
            userManagementData = JSON.parse(userManagementData);
            return resolve(userManagementData);

        } catch (error) {
            return reject(error);
        }
    });
}

/**
  * To create platForm User 
  * @function
  * @name createPlatformUser
  * @param userDetails - user details 
  * @param token - logged in user token  
  * @returns {json} returns created user details
*/

const createPlatformUser = function (userDetails, token) {
    return new Promise(async (resolve, reject) => {
        try {

            let platformUserRolesUrl =
                apiBaseUrl + constants.endpoints.PLATFORM_USER_CREATE;
            let requestBody = userDetails;
            console.log(platformUserRolesUrl,"createResponse");
            let createResponse = await httpCall(platformUserRolesUrl, token, requestBody, "POST");
            console.log(platformUserRolesUrl,"createResponse",createResponse);
            return resolve(createResponse);

        } catch (error) {
            return reject(error);
        }
    });
}

/**
  * To update platForm user data
  * @function
  * @name updatePlatFormUser
  * @param userInfo - user details
  * @param token - logged in user token
  * @returns {Json} returns user details
*/

const updatePlatFormUser = function (userInfo, token) {
    return new Promise(async (resolve, reject) => {
        try {

            let platformUserUpdateUrl =
                apiBaseUrl + constants.endpoints.PLATFORM_USER_UPDATE;
            let requestBody = userInfo;
            let response = await httpCall(platformUserUpdateUrl, token, requestBody, "POST");
            console.log("response",response);
            return resolve(response);

        } catch (error) {
            return reject(error);
        }
    });
}

/**
  * To activate the user
  * @function
  * @name activate
  * @param userId - keyclock user id
  * @param token - logged in user token
  * @returns {json} consists of response from the actiavte api
*/

const activate = function (userId, token) {
    return new Promise(async (resolve, reject) => {
        try {

            let platformUserStatusUpdateUrl =
                apiBaseUrl + constants.endpoints.ACTIVATE_USER;
            let requestBody = { userId: userId };
            let response = await httpCall(platformUserStatusUpdateUrl, token, requestBody, "POST");
            return resolve(response);

        } catch (error) {
            return reject(error);
        }
    });
}

/**
  * To deactivate the user
  * @function
  * @name inactivate
  * @param userId - keyclock user id
  * @param token - logged in user token
  * @returns consists of response from the deactiavte api
*/

const inactivate = function (userId, token) {
    return new Promise(async (resolve, reject) => {
        try {

            let platformUserStatusUpdateUrl =
                apiBaseUrl + constants.endpoints.INACTIVATE_USER;
            let requestBody = { userId: userId };
            let response = await httpCall(platformUserStatusUpdateUrl, token, requestBody, "POST");
            return resolve(response);

        } catch (error) {
            return reject(error);
        }
    });
}


/**
  * To get user details for a specific user
  * @function
  * @name userDetails
  * @param userId - user id.
  * @param token - Logged in user token.
  * @returns {Json} returns a user details.
*/

const userDetails = function (userId, token) {
    return new Promise(async (resolve, reject) => {
        try {

            const userDetailsAPIUrl =
                apiBaseUrl + constants.endpoints.USER_DETAILS;
            let requestBody = { userId: userId };
            let userDetails = await httpCall(userDetailsAPIUrl, token, requestBody, "POST");
            return resolve(userDetails);

        } catch (error) {
            return reject(error);
        }
    });
}


/**
* Common http request call 
* @name httpCall
* @param {String} url filePath of the file to upload
* @param {String} token user access token
* @param {Json} requestBody body of the request
* @returns {Json} - consists of api response body
*/
function httpCall(url, token, requestBody= "", type = "") {
    return new Promise(async (resolve, reject) => {
        try {

            let options = {
                "headers": {
                    'Content-Type': "application/json",
                    "X-authenticated-user-token": token,
                    "authorization": process.env.AUTHORIZATION,
                    "internal-access-token": process.env.INTERNAL_ACCESS_TOKEN
                }
            };

            let apiUrl = url;

            if (type == "POST") {
                options["json"] = requestBody;
                request.post(apiUrl, options, callback);
            } else {
                request.get(apiUrl, options, callback);
            }
            function callback(err, data) {
                if (err) {
                    return reject({
                        message: constants.apiResponses.USER_MANAGEMENT_SERVICE_DOWN
                    });
                } else {
                    console.log("data.body---",data.body);
                    return resolve(data.body);
                }
            }
        } catch (error) {
            return reject(error);
        }
    })
}


module.exports = {
    platformUserProfile: platformUserProfile,
    createPlatformUser: createPlatformUser,
    updatePlatFormUser: updatePlatFormUser,
    userDetails: userDetails,
    activate: activate,
    inactivate: inactivate
};