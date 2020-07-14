/**
 * name : roles/helper.js
 * author : Rakesh Kumar
 * created-date : 06-July-2020
 * Description : sunbird roles related functionality.
 */

const sessionHelpers = require(ROOT_PATH + "/generics/helpers/sessions");

/**
   * RolesHelper
   * @class
*/



module.exports = class RolesHelper {

    /**
      * To get all platform roles
      * @method
      * @name list
      * @returns {Object} returns a platform roles information
     */

    static list() {
        return new Promise(async (resolve, reject) => {
            try {

                let roles = sessionHelpers.get("sunbirdRoles");
                if (!roles) {
                    let rolesDoc =
                        await cassandraDatabase.models.role.findAsync(
                            {   }, {
                            select:  ["id", "name"], raw: true, allow_filtering: true
                        });
                        sessionHelpers.set("sunbirdRoles",rolesDoc);

                    if (!rolesDoc) {
                        return resolve({
                            message: constants.apiResponses.ROLES_NOT_FOUND,
                        });
                    }
                    roles = rolesDoc;
                }
                return resolve({ message: constants.apiResponses.ROLES_FOUND, result: roles });
                
            } catch (error) {
                return reject(error);
            }
        })
    }


};