/**
 * name : entityTypes/helper.js
 * author : Rakesh Kumar
 * created-date : 01-Jun-2020
 * Description : Entity types related helper functionality.
 */

 /**
    * EntityTypesHelper
    * @class
*/
module.exports = class EntityTypesHelper {

    /**
      * List of all entity types.
      * @method
      * @name list
      * @param {Object} [queryParameter = "all"] - Filtered query data.
      * @param {Object} [projection = {}] - Projected data.   
      * @returns {Object} returns a entity types list from the filtered data.
     */

    static list(queryParameter = "all", projection = {}) {
        return new Promise(async (resolve, reject) => {
            try {

                if( queryParameter === "all" ) {
                    queryParameter = {};
                };

                let entityTypeData = 
                await database.models.entityTypes.find(queryParameter, projection).lean();

                return resolve(entityTypeData);

            } catch (error) {
                return reject(error);
            }
        })

    }

};