const moment = require("moment");


module.exports = class entitiesHelper {


   /**
   * List entity documents.
   * @method
   * @name entityDocuments
   * @param {Object} [findQuery = "all"] - filter query object if not provide 
   * it will load all the document.
   * @param {Array} [fields = "all"] - All the projected field. If not provided
   * returns all the field
   * @param {Number} [limitingValue = ""] - total data to limit.
   * @param {Number} [skippingValue = ""] - total data to skip.
   * @returns {Array} - returns an array of entities data.
   */
  static entityDocuments(
    findQuery = "all", 
    fields = "all",
    skipFields = "none", 
    limitingValue = "", 
    skippingValue = "",
    sortedData = ""
    ) {
        return new Promise(async (resolve, reject) => {
            try {
                
                let queryObject = {};
                
                if (findQuery != "all") {
                    queryObject = findQuery;
                }
                
                let projectionObject = {};
                
                if (fields != "all") {
                    
                    fields.forEach(element => {
                        projectionObject[element] = 1;
                    });
                }

                if (skipFields != "none") {
                    skipFields.forEach(element => {
                        projectionObject[element] = 0;
                    });
                }
                
                let entitiesDocuments;
                
                if( sortedData !== "" ) {
                    
                    entitiesDocuments = await database.models.entities
                    .find(queryObject, projectionObject)
                    .sort(sortedData)
                    .limit(limitingValue)
                    .skip(skippingValue)
                    .lean();
                } else {
                    
                    entitiesDocuments = await database.models.entities
                    .find(queryObject, projectionObject)
                    .limit(limitingValue)
                    .skip(skippingValue)
                    .lean();
                }
                return resolve(entitiesDocuments);
            } catch (error) {
                return reject(error);
            }
        });
    }

    /**
     * List all entities based on type.
     * @method
     * @name listByEntityType
     * @param {Object} data 
     * @param {String} data.entityType - entity type
     * @param {Number} data.pageSize - total page size.
     * @param {Number} data.pageNo - page number.
     * @returns {Array} - List of all entities based on type.
     */

    static listByEntityType(data) {
        return new Promise(async (resolve, reject) => {
            try {

                let entityName = constants.schema.METAINFORMATION + "." +
                    constants.schema.NAME;

                let entityExternalId = constants.schema.METAINFORMATION + "." +
                    constants.schema.EXTERNALID;

                let createdAt = constants.schema.CREATED_AT;

                let projection = [entityName, entityExternalId,createdAt];

                let skippingValue = data.pageSize * (data.pageNo - 1);

                let entityDocuments = await this.entityDocuments({
                    entityType: data.entityType
                },
                    projection,
                    "none",
                    data.pageSize,
                    skippingValue,
                    {
                        [entityName]: 1
                    }
                );

                if (entityDocuments.length < 1) {
                    throw {
                        status: httpStatusCode.not_found.status,
                        message: constants.apiResponses.ENTITY_NOT_FOUND
                    };
                }

                entityDocuments = entityDocuments.map(entityDocument => {

                    // console.log("entityDocument",entityDocument);
                    return {
                        externalId: entityDocument.metaInformation.externalId,
                        name: entityDocument.metaInformation.name,
                        _id: entityDocument._id,
                        createdAt: moment(entityDocument.createdAt).format("Do MMM YYYY")
                    }
                });

                return resolve({
                    message: constants.apiResponses.ENTITIES_FETCHED,
                    result: entityDocuments
                });

            } catch (error) {
                reject(error);
            }
        })

    }

        /**
     * Get immediate entities for requested Array.
     * @method
     * @name subList
     * @param {params} entities - array of entitity ids
     * @param {params} entityId - single entitiy id
     * @param {params} type - sub list entity type. 
     * @param {params} search - search entity data. 
     * @param {params} limit - page limit. 
     * @param {params} pageNo - page no. 
     * @returns {Array} - List of all sub list entities.
     */

    static subEntityList( entities,entityId,type,search,limit,pageNo ) {
        return new Promise(async (resolve, reject) => {

            try {

                let result = [];
                let obj = {
                    entityId : entityId,
                    type : type,
                    search : search,
                    limit : limit,
                    pageNo : pageNo
                }
    
                if ( entityId !== "" ) {
                    result = await this.subEntities(
                        obj
                    );
                } else {
    
                    await Promise.all(entities.map(async (entity)=> {
    
                        obj["entityId"] = entity;
                        let entitiesDocument = await this.subEntities(
                            obj
                        );

                        if( Array.isArray(entitiesDocument.data) && 
                        entitiesDocument.data.length > 0
                        ) {
                            result = entitiesDocument;
                        }
                    }));
                }

                if( result.data && result.data.length > 0 ) {
                    result.data = result.data.map(data=>{
                        let cloneData = {...data};
                        cloneData["label"] = cloneData.name;
                        cloneData["value"] = cloneData._id;
                        return cloneData;
                    })
                }
    
                resolve({
                    message: constants.apiResponses.ENTITIES_FETCHED,
                    result: result
                });   
            } catch(error) {
                return reject(error);
            }
        })
    }

      /**
     * Get either immediate entities or entity traversal based upon the type.
     * @method
     * @name subEntities
     * @param {body} entitiesData
     * @returns {Array} - List of all immediate entities or traversal data.
     */

    static subEntities( entitiesData ) {
        return new Promise(async (resolve, reject) => {

            try {
                
                let entitiesDocument;
                
                if( entitiesData.type !== "" ) {
                    
                    entitiesDocument = await this.entityTraversal(
                        entitiesData.entityId,
                        entitiesData.type,
                        entitiesData.search,
                        entitiesData.limit,
                        entitiesData.pageNo
                        );
                } else {
                    
                    entitiesDocument = await this.immediateEntities(
                        entitiesData.entityId, 
                        entitiesData.search,
                        entitiesData.limit,
                        entitiesData.pageNo
                    );
                }
                
                return resolve(entitiesDocument);
            } catch(error) {
                return reject(error);
            }
        })
    }

     /**
    * Get immediate entities.
    * @method
    * @name entityTraversal
    * @param {Object} entityId
    * @returns {Array} - List of all immediateEntities based on entityId.
    */

   static entityTraversal(
    entityId,
    entityTraversalType = "", 
    searchText = "",
    pageSize,
    pageNo
 ) {
     return new Promise(async (resolve, reject) => {
         try {
             
             let entityTraversal = `groups.${entityTraversalType}`;

             let entitiesDocument = 
             await this.entityDocuments(
                 { 
                     _id: entityId,
                     "groups" : { $exists : true }, 
                     [entityTraversal] : { $exists: true } 
                 },
                 [ entityTraversal ]
             );

             if( !entitiesDocument[0] ) {
                 return resolve([]);
             }

             let result = [];
             
             if( entitiesDocument[0].groups[entityTraversalType].length > 0 ) {
                 
                 let entityTraversalData = await this.search(
                     searchText,
                     pageSize,
                     pageNo,
                     entitiesDocument[0].groups[entityTraversalType]
                 );

                 result = entityTraversalData[0];

             }

             return resolve(result);

         } catch(error) {
             return reject(error);
         }
     })
}

   /**
   * Search entity.
   * @method 
   * @name search
   * @param {String} searchText - Text to be search.
   * @param {Number} pageSize - total page size.
   * @param {Number} pageNo - Page no.
   * @param {Array} [entityIds = false] - Array of entity ids.
   */

  static search( searchText, pageSize, pageNo, entityIds = false ) {
    return new Promise(async (resolve, reject) => {
        try {

            let queryObject = {};

            queryObject["$match"] = {};

            if (entityIds && entityIds.length > 0) {
                queryObject["$match"]["_id"] = {};
                queryObject["$match"]["_id"]["$in"] = entityIds;
            }

            if( searchText !== "") {
                queryObject["$match"]["$or"] = [
                    { "metaInformation.name": new RegExp(searchText, 'i') },
                    { "metaInformation.externalId": new RegExp("^" + searchText, 'm') },
                    { "metaInformation.addressLine1": new RegExp(searchText, 'i') },
                    { "metaInformation.addressLine2": new RegExp(searchText, 'i') }
                ];
            }

            let entityDocuments = await database.models.entities.aggregate([
                queryObject,
                {
                    $project: {
                        name: "$metaInformation.name",
                        externalId: "$metaInformation.externalId",
                        addressLine1: "$metaInformation.addressLine1",
                        addressLine2: "$metaInformation.addressLine2",
                        entityType : 1
                    }
                },
                {
                    $facet: {
                        "totalCount": [
                            { "$count": "count" }
                        ],
                        "data": [
                            { $skip: pageSize * (pageNo - 1) },
                            { $limit: pageSize }
                        ],
                    }
                }, {
                    $project: {
                        "data": 1,
                        "count": {
                            $arrayElemAt: ["$totalCount.count", 0]
                        }
                    }
                }
            ]);

            return resolve(entityDocuments);

        } catch (error) {
            return reject(error);
        }
    })
  }

}