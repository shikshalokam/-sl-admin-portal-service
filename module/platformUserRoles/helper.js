/**
 * name : platform-user-roles/helper.js
 * author : Rakesh Kumar
 * Date : 17-March-2020
 * Description : All platform user profile helper related information.
 */

const userManagementService = 
require( SERVICES_PATH+"/user-management");

module.exports = class platFormUserProfileHelper {

    /**
   * Get platform user profile.
   * @method
   * @name getProfile
   * @param {String} userId - user id 
   * @param {String} token - user access token
   * @returns {json} Response consists of requested user user profile data.
   */

    static getProfile( userId,token ) {
        return new Promise(async (resolve, reject) => {
            try {

                let userProfileCreationData = 
                await userManagementService.platformUserProfile(
                    userId,
                    token
                )

                return resolve(userProfileCreationData);

            } catch (error) {
                return reject(error);
            }
        })
    }

};