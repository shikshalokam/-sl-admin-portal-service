/**
 * name : user-management.js
 * author : Rakesh Kumar
 * Date : 17-March-2020
 * Description : All user management related api call.
 */

//dependencies

let urlPrefix =
    process.env.USER_MANAGEMENT_HOST +
    process.env.USER_MANAGEMENT_BASE_URL +
    process.env.URL_PREFIX;

const request = require('request');

/**
  * Get platform user roles
  * @function
  * @name platformUserProfile
  * @returns {Json} returns a platform user profile info.
*/

const platformUserProfile = function (userId, token) {
    return new Promise(async (resolve, reject) => {
        try {
            let platformUserRolesUrl =
            urlPrefix + constants.endpoints.PLATFORM_USER_PROFILE + "/" + userId;

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
    })

}

/**
  * post create PlatForm User 
  * @function
  * @name createPlatFormUser
  * @returns {json} returns created user details
*/

const createPlatFormUser = function (requestBody, token) {
    return new Promise(async (resolve, reject) => {
        try {

            let platformUserRolesUrl =
        urlPrefix + constants.endpoints.PLATFORM_USER_CREATE;
            let options = {
                "headers": {
                    "content-type": "application/json",
                    "authorization": process.env.AUTHORIZATION,
                    "x-authenticated-user-token": token,
                },
                json: requestBody
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
    })

}

/**
  * to update PlatForm User data
  * @function
  * @name updatePlatFormUser
  * @returns {Json} returns user details
*/

const updatePlatFormUser = function (requestBody, token) {
    return new Promise(async (resolve, reject) => {
        try {

            let platformUserUpdateUrl =
        urlPrefix + constants.endpoints.PLATFORM_USER_UPDATE;
            let options = {
                "headers": {
                    "content-type": "application/json",
                    "authorization": process.env.AUTHORIZATION,
                    "x-authenticated-user-token": token,
                },
                json: requestBody
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
    })

}

/**
  * To activate the user
  * @function
  * @name activateUser
  * @returns {json} consists of response from the actiavte api
*/

const activateUser = function (userId, token) {
    return new Promise(async (resolve, reject) => {
        try {

            let platformUserStatusUpdateUrl =
        urlPrefix + constants.endpoints.ACTIVE_USER;

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
    })

}

/**
  * To deactivate the user
  * @function
  * @name inActivateUser
  * @returns consists of response from the deactiavte api
*/

const inActivateUser = function (userId, token) {
    return new Promise(async (resolve, reject) => {
        try {

            let platformUserStatusUpdateUrl =
        urlPrefix + constants.endpoints.INACTIVE_USER;

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
    })

}


/**
  * to get user details from user-management service
  * @function
  * @name userDetails
  * @returns {Promise} returns a promise.
*/

const userDetails = function (userId, token) {
    return new Promise(async (resolve, reject) => {
        try {
            const userDetailsAPIUrl =
                urlPrefix + constants.endpoints.USER_DETAILS;

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
    })
}


module.exports = {
    platformUserProfile: platformUserProfile,
    createPlatFormUser: createPlatFormUser,
    updatePlatFormUser: updatePlatFormUser,
    userDetails: userDetails,
    activateUser: activateUser,
    inActivateUser:inActivateUser
};