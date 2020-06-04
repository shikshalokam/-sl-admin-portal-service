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

                if (queryParameter === "all") {
                    queryParameter = {};
                };

                projection = {
                    name: 1, _id: 1
                }

                let entityTypeData =
                    await database.models.entityTypes.find(queryParameter, projection).lean();

                if (!entityTypeData) {

                    return resolve({ message: constants.apiResponses.ENTITY_TYPE_NOT_FOUND, 
                         });

                }
                
                let entityTypeArray = [];
                entityTypeData.map(types => {

                    let entityType = {
                        label: types.name,
                        value: types._id
                    }
                    entityTypeArray.push(entityType);
                })
                return resolve({ message: constants.apiResponses.ENTITY_TYPE_FETCHED, result: entityTypeArray });

            } catch (error) {
                return reject(error);
            }
        })

    }

};