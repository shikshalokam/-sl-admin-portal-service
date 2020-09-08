/**
 * name : platformRoles/helper.js
 * author : Rakesh Kumar
 * created-date : 06-July-2020
 * Description : Platform roles related functionality.
 */


const sessionHelpers = require(GENERIC_HELPERS_PATH + "/sessions");

/**
   * PlatformRolesHelper
   * @class
*/
module.exports = class PlatformRolesHelper {

    /**
      * To get all platform roles
      * @method
      * @name list
      * @param {Object} [queryParameter = "all"] - Filtered query data.
      * @param {Array} [fieldsArray = {}] - Projected data.   
      * @param {Object} [skipFields = "none" ]
      * @returns {Object} returns a platform roles information
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

                let platformRolesDoc =
                    await database.models.platformRolesExt.find(queryParameter, projection).lean();

                if (!platformRolesDoc) {
                    return resolve({
                        message: CONSTANTS.apiResponses.PLATFORMROLES_NOT_FOUND,
                    });
                }
                return resolve({ message: CONSTANTS.apiResponses.PLATFORMROLES_FOUND, result: platformRolesDoc });

            } catch (error) {
                return reject(error);
            }
        })
    }

    /**
     * To get all platform roles
     * @method
     * @name getRoles
     * @param {Object} [queryParameter = "all"] - Filtered query data.
     * @param {Array} [fieldsArray = {}] - Projected data.   
     * @param {Object} [skipFields = "none" ]
     * @returns {Object} returns a platform roles information
    */
   static getRoles() {
        return new Promise(async (resolve, reject) => {
            try {

                let roles = sessionHelpers.get("customRoles");
                if (!roles) {

                    let rolesDoc = await this.list({ isDeleted: false,isHidden: false }, ["code", "title"]);
                    if (rolesDoc && rolesDoc.result) {
                        roles = rolesDoc.result;
                        sessionHelpers.set("customRoles", rolesDoc.result);
                    }

                }
                resolve({ message : CONSTANTS.apiResponses.PLATFORMROLES_FOUND, result :roles });
            } catch (error) {
                return reject(error);
            }
        })
    }
};