/**
 * name : organisations/helper.js
 * author : Rakesh Kumar
 * Date : 19-March-2020
 * Description : All platform organisation related information.
 */

let sunBirdService = 
require(ROOT_PATH +"/generics/services/sunbird");

module.exports = class platFormUserProfileHelper {

    /**
   * Get platform organisations list.
   * @method
   * @name list
    * @returns {json} Response consists of organisations.
   */

    static list(token) {
        return new Promise(async (resolve, reject) => {
            try {
                let organisationList = 
                await sunBirdService.organisationList(token);

                return resolve({ result: organisationList });

            } catch (error) {
                return reject(error);
            }
        })
    }

};