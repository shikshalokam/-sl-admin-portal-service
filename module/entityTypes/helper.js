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
      * To get all entityTypes
      * @method
      * @name list
      * @param {Object} [queryParameter = "all"] - Filtered query data.
      * @param {Array} [fieldsArray = {}] - Projected data.   
      * @param {Object} [skipFields = "none" ]
      * @returns {Object} returns a entity types list from the filtered data.
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


                const entityTypeData =
                    await database.models.entityTypes.find(queryParameter, projection).lean();

                if (!entityTypeData) {

                    return resolve({
                        message: CONSTANTS.apiResponses.ENTITY_TYPE_NOT_FOUND,
                    });
                }

                return resolve({ message: CONSTANTS.apiResponses.ENTITY_TYPE_FETCHED, result: entityTypeData });

            } catch (error) {
                return reject(error);
            }
        })

    }

    /**
    * List of all entity types.
    * @method
    * @name entityList
    * @param {Object} [queryParameter = "all"] - Filtered query data.
    * @param {Array} [fieldsArray = {}] - Projected data.   
   */

    static getList(queryObject, fieldsArray) {
        return new Promise(async (resolve, reject) => {
            try {

                let entityTypeData = await this.all(queryObject, fieldsArray);

                let entityTypeArray = [];
                if (entityTypeData && entityTypeData.result) {
                    entityTypeData.result.map(types => {
                        let entityType = {
                            label: types.name,
                            value: types._id,
                        }
                        entityTypeArray.push(entityType);
                    })
                }
                return resolve({ message: CONSTANTS.apiResponses.ENTITY_TYPE_FETCHED, result: entityTypeArray });

            } catch (error) {
                return reject(error);
            }
        })

    }

};