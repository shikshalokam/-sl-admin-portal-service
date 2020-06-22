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

    static list(queryParameter = "all", fieldsArray = "all" ) {
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