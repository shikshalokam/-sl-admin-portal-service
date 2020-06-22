/**
 * name : user-management.js
 * author : Rakesh Kumar
 * Date : 17-March-2020
 * Description : All user management related api call.
 */

//dependencies

let apiBaseUrl =
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
            const _userManagementCallBack = function (err, response) {
                if (err) {
                    logger.error("Failed to connect to user management service.");
                } else {
                    let userManagementData = JSON.parse(response.body);
                    return resolve(userManagementData);
                }
            }

            request.get(
                platformUserRolesUrl, {
                headers: {
                    "internal-access-token": process.env.INTERNAL_ACCESS_TOKEN,
                    "X-authenticated-user-token": token
                }
            },
                _userManagementCallBack
            )
        } catch (error) {
            return reject(error);
        }
    });
}

/**
  * To create platForm User 
  * @function
  * @name createPlatFormUser
  * @param userDetails - user details 
  * @param token - logged in user token  
  * @returns {json} returns created user details
*/

const createPlatFormUser = function (userDetails, token) {
    return new Promise(async (resolve, reject) => {
        try {

            let platformUserRolesUrl =
                apiBaseUrl + constants.endpoints.PLATFORM_USER_CREATE;
            let options = {
                "headers": {
                    "content-type": "application/json",
                    "authorization": process.env.AUTHORIZATION,
                    "x-authenticated-user-token": token,
                },
                json: userDetails
            };

            request.post(platformUserRolesUrl, options, callback);
            function callback(err, data) {
                if (err) {
                    return reject({
                        message: constants.apiResponses.SUNBIRD_SERVICE_DOWN
                    });
                } else {
                    let dialCodeData = data.body;
                    return resolve(dialCodeData);
                }
            }
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
            let options = {
                "headers": {
                    "content-type": "application/json",
                    "authorization": process.env.AUTHORIZATION,
                    "x-authenticated-user-token": token,
                },
                json: userInfo
            };

            request.post(platformUserUpdateUrl, options, callback);
            function callback(err, data) {
                if (err) {
                    return reject({
                        message: constants.apiResponses.SUNBIRD_SERVICE_DOWN
                    });
                } else {
                    let dialCodeData = data.body;
                    return resolve(dialCodeData);
                }
            }
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
                apiBaseUrl + constants.endpoints.ACTIVE_USER;

            let options = {
                "headers": {
                    "content-type": "application/json",
                    "authorization": process.env.AUTHORIZATION,
                    "x-authenticated-user-token": token,
                    "internal-access-token": process.env.INTERNAL_ACCESS_TOKEN
                },
                json: { userId: userId }
            };
            request.post(platformUserStatusUpdateUrl, options, callback);
            function callback(err, data) {
                if (err) {
                    return reject({
                        message: constants.apiResponses.SUNBIRD_SERVICE_DOWN
                    });
                } else {
                    return resolve(data.body);
                }
            }

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
                apiBaseUrl + constants.endpoints.INACTIVE_USER;
            let options = {
                "headers": {
                    "content-type": "application/json",
                    "authorization": process.env.AUTHORIZATION,
                    "x-authenticated-user-token": token,
                    "internal-access-token": process.env.INTERNAL_ACCESS_TOKEN
                },
                json: { userId: userId }
            };
            request.post(platformUserStatusUpdateUrl, options, callback);
            function callback(err, data) {
                if (err) {
                    return reject({
                        message: constants.apiResponses.SUNBIRD_SERVICE_DOWN
                    });
                } else {
                    return resolve(data.body);
                }
            }

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
            let options = {
                "headers": {
                    "content-type": "application/json",
                    "authorization": process.env.AUTHORIZATION,
                    "x-authenticated-user-token": token,
                },
                json: { userId: userId }
            };
            request.post(userDetailsAPIUrl, options, callback);

            function callback(err, data) {
                if (err) {
                    return reject({
                        message: constants.apiResponses.SUNBIRD_SERVICE_DOWN
                    });
                } else {

                    return resolve(data.body);
                }
            }

        } catch (error) {
            return reject(error);
        }
    });
}


module.exports = {
    platformUserProfile: platformUserProfile,
    createPlatFormUser: createPlatFormUser,
    updatePlatFormUser: updatePlatFormUser,
    userDetails: userDetails,
    activate: activate,
    inactivate: inactivate
};