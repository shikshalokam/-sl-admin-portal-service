const moment = require("moment");
let entityTypesHelper = require(MODULES_BASE_PATH + "/entity-types/helper");

let kendrService =
    require(ROOT_PATH + "/generics/services/kendra-service");

const csv = require('csvtojson');


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

                if (sortedData !== "") {

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
                let count = await database.models.entities
                    .countDocuments(queryObject);

                return resolve({ count: count, data: entitiesDocuments });
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

                let childHierarchyPath = constants.schema.CHILD_HIERARCHY_PATH;

                let projection = [childHierarchyPath, entityName, entityExternalId, createdAt];


                let skippingValue = data.pageSize * (data.pageNo - 1);


                let entityDocs = await this.entityDocuments({
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
                let entityDocuments = entityDocs.data;

                if (entityDocuments.length < 1) {
                    throw {
                        status: httpStatusCode.not_found.status,
                        message: constants.apiResponses.ENTITY_NOT_FOUND
                    };
                }

                entityDocuments = entityDocuments.map(entityDocument => {

                    return {
                        externalId: entityDocument.metaInformation.externalId,
                        name: entityDocument.metaInformation.name,
                        _id: entityDocument._id,
                        subEntities: entityDocument.childHierarchyPath,
                        createdAt: moment(entityDocument.createdAt).format("Do MMM YYYY")

                    }
                });

                let columns = _entityListColumns();
                return resolve({
                    message: constants.apiResponses.ENTITIES_FETCHED,
                    result: {
                        count: entityDocs.count,
                        columns: columns,
                        data: entityDocuments
                    }

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

    static subEntityList(entities, entityId, type, search, limit, pageNo) {
        return new Promise(async (resolve, reject) => {

            try {

                let result = [];
                let obj = {
                    entityId: entityId,
                    type: type,
                    search: search,
                    limit: limit,
                    pageNo: pageNo
                }

                if (entityId !== "") {
                    result = await this.subEntities(
                        obj
                    );
                } else {

                    await Promise.all(entities.map(async (entity) => {

                        obj["entityId"] = entity;
                        let entitiesDocument = await this.subEntities(
                            obj
                        );

                        if (Array.isArray(entitiesDocument.data) &&
                            entitiesDocument.data.length > 0
                        ) {
                            result = entitiesDocument;
                        }
                    }));
                }

                if (result.data && result.data.length > 0) {
                    result.data = result.data.map(data => {
                       
                        let cloneData = { ...data };
                        // cloneData["label"] = cloneData.name;
                        // cloneData["_id"] = cloneData._id;
                        cloneData['address'] = cloneData.addressLine1;
                        if (cloneData.addressLine1) {
                            delete cloneData.addressLine1;
                        }
                        return cloneData;
                    })
                }

                let columns = _subEntityListColumns();
                resolve({
                    message: constants.apiResponses.ENTITIES_FETCHED,
                    result: {
                        count: result.count ? result.count : 0,
                        columns: columns,
                        data: result.data
                    }
                });
            } catch (error) {
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

    static subEntities(entitiesData) {
        return new Promise(async (resolve, reject) => {

            try {

                let entitiesDocument;

                if (entitiesData.type !== "") {

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
            } catch (error) {
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

                let entityDocs =
                    await this.entityDocuments(
                        {
                            _id: entityId,
                            "groups": { $exists: true },
                            [entityTraversal]: { $exists: true }
                        },
                        [entityTraversal]
                    );

                let entitiesDocument = entityDocs.data;

                if (!entitiesDocument[0]) {
                    return resolve([]);
                }

                let result = [];

                if (entitiesDocument[0].groups[entityTraversalType].length > 0) {

                    let entityTraversalData = await this.search(
                        searchText,
                        pageSize,
                        pageNo,
                        entitiesDocument[0].groups[entityTraversalType]
                    );

                    result = entityTraversalData[0];

                }

                return resolve(result);

            } catch (error) {
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

    static search(searchText, pageSize, pageNo, entityIds = false) {
        return new Promise(async (resolve, reject) => {
            try {

                let queryObject = {};

                queryObject["$match"] = {};

                if (entityIds && entityIds.length > 0) {
                    queryObject["$match"]["_id"] = {};
                    queryObject["$match"]["_id"]["$in"] = entityIds;
                }

                if (searchText !== "") {
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
                            entityType: 1
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

    /**
  * Get immediate entities.
  * @method
  * @name listByEntityType
  * @param {Object} entityId
  * @returns {Array} - List of all immediateEntities based on entityId.
  */

    static immediateEntities(entityId, searchText = "", pageSize = "", pageNo = "") {
        return new Promise(async (resolve, reject) => {

            try {

                let projection = [
                    constants.schema.ENTITYTYPE,
                    constants.schema.GROUPS
                ];

                let entiesDocs =
                    await this.entityDocuments({
                        _id: entityId
                    }, projection);

                let entitiesDocument = entiesDocs.data;
                let immediateEntities = [];

                if (entitiesDocument[0] &&
                    entitiesDocument[0].groups &&
                    Object.keys(entitiesDocument[0].groups).length > 0
                ) {

                    let getImmediateEntityTypes =
                        await entityTypesHelper.list({
                            name: entitiesDocument[0].entityType
                        }, ["immediateChildrenEntityType"]
                        );

                    let immediateEntitiesIds;

                    Object.keys(entitiesDocument[0].groups).forEach(entityGroup => {
                        if (
                            getImmediateEntityTypes[0].immediateChildrenEntityType &&
                            getImmediateEntityTypes[0].immediateChildrenEntityType.length > 0 &&
                            getImmediateEntityTypes[0].immediateChildrenEntityType.includes(entityGroup)
                        ) {
                            immediateEntitiesIds =
                                entitiesDocument[0].groups[entityGroup];
                        }
                    })

                    if (
                        Array.isArray(immediateEntitiesIds) &&
                        immediateEntitiesIds.length > 0
                    ) {

                        let searchImmediateData = await this.search(
                            searchText,
                            pageSize,
                            pageNo,
                            immediateEntitiesIds
                        );

                        immediateEntities = searchImmediateData[0];
                    }
                }

                return resolve(immediateEntities);

            } catch (error) {
                return reject(error);
            }
        })
    }

    /**
    * Entity details information.
    * @method 
    * @name details
    * @param {String} entityId - _id of entity.
    * @return {Object} - consists of entity details information. 
    */

    static details(entityId) {
        return new Promise(async (resolve, reject) => {
            try {

                let entityDocument = await this.entityDocuments(
                    {
                        _id: entityId
                    },
                    "all",
                    ["groups"]
                );

                let projection = ["metaInformation.externalId", "metaInformation.name",
                    "metaInformation.addressLine1", "metaInformation.addressLine2",
                    "metaInformation.administration", "metaInformation.city",
                    "metaInformation.country", "entityTypeId", "entityType"];

                
                if(entityDocument && entityDocument.data && entityDocument.data.length == 0){
                    reject({
                        message: constants.apiResponses.ENTITY_NOT_FOUND,
                        result: result
                    });
                }

                let relatedEntitiesDocs = await this.relatedEntitiesDetails(entityDocument.data[0]._id, entityDocument.data[0].entityTypeId, entityDocument.data[0].entityType, projection);
                let relatedEntities = relatedEntitiesDocs.data;
                let result = {};

                _.merge(result, entityDocument.data[0]);
                result["relatedEntities"] = relatedEntities;

                if (!entityDocument.data) {
                    return resolve({
                        status: httpStatusCode.bad_request.status,
                        message: constants.apiResponses.ENTITY_NOT_FOUND
                    })
                }

                resolve({
                    message: constants.apiResponses.ENTITY_INFORMATION_FETCHED,
                    result: result
                });

            } catch (error) {
                return reject(error);
            }
        })
    }



    /**
   * All the related entities and metainfomration for the given entity
   * @method
   * @name relatedEntities
   * @param {String} entityId - entity id.
   * @returns {Array} - returns an entities with related entity information.
   */
    static relatedEntities(entityId) {

        return new Promise(async (resolve, reject) => {
            try {
                let result = {}
                let projection = ["metaInformation.externalId", "metaInformation.name",
                    "metaInformation.addressLine1", "metaInformation.addressLine2",
                    "metaInformation.administration", "metaInformation.city",
                    "metaInformation.country", "entityTypeId", "entityType"];
                let entityDocs = await this.entityDocuments({ _id: entityId }, projection);

                let entityDocument = entityDocs.data;
                if (entityDocument.length < 1) {
                    throw {
                        status: httpStatusCode.not_found.status,
                        message: constants.apiResponses.ENTITY_NOT_FOUND
                    };
                }

                let relatedEntitiesDocs = await this.relatedEntitiesDetails(entityDocument[0]._id, entityDocument[0].entityTypeId, entityDocument[0].entityType, projection);
                let relatedEntities = relatedEntitiesDocs.data;

               
                _.merge(result, entityDocument[0])
                result["relatedEntities"] = relatedEntities;
                resolve({ message: constants.apiResponses.ENTITY_INFORMATION_FETCHED, result: result });

            } catch (error) {
                return reject({
                    status: error.status || httpStatusCode.internal_server_error.status,
                    message: error.message || httpStatusCode.internal_server_error.message
                });
            }
        })

    }


    /**
     * All the related entities for the given entities.
     * @method
     * @name relatedEntitiesDetails
     * @param {String} entityId - entity id.
     * @param {String} entityTypeId - entity type id.
     * @param {String} entityType - entity type.
     * @param {Array} [projection = "all"] - total fields to be projected.
     * @returns {Array} - returns an array of related entities data.
     */

    static relatedEntitiesDetails(entityId, entityTypeId, entityType, projection = "all") {
        return new Promise(async (resolve, reject) => {
            try {

                if (this.entityMapProcessData && this.entityMapProcessData.relatedEntities && this.entityMapProcessData.relatedEntities[entityId.toString()]) {
                    return resolve(this.entityMapProcessData.relatedEntities[entityId.toString()]);
                }

                let relatedEntitiesQuery = {};

                if (entityTypeId && entityId && entityType) {
                    relatedEntitiesQuery[`groups.${entityType}`] = entityId;
                    relatedEntitiesQuery["entityTypeId"] = {};
                    relatedEntitiesQuery["entityTypeId"]["$ne"] = entityTypeId;
                } else {
                    throw {
                        status: httpStatusCode.bad_request.status,
                        message: constants.apiResponses.MISSING_ENTITYID_ENTITYTYPE_ENTITYTYPEID
                    };
                }

                let relatedEntitiesDocument = await this.entityDocuments(relatedEntitiesQuery, projection);
                relatedEntitiesDocument = relatedEntitiesDocument ? relatedEntitiesDocument : [];

                if (this.entityMapProcessData && this.entityMapProcessData.relatedEntities) {
                    this.entityMapProcessData.relatedEntities[entityId.toString()] = relatedEntitiesDocument;
                }

                return resolve(relatedEntitiesDocument);


            } catch (error) {
                return reject({
                    status: error.status || httpStatusCode.internal_server_error.status,
                    message: error.message || httpStatusCode.internal_server_error.message
                });
            }
        })
    }


    /**
       * State create entity form
       * @method
       * @name stateCreateForm
       * @returns {json} - response consist of state create dynamic form
       */
    static stateCreateForm() {
        return new Promise(async (resolve, reject) => {
            try {

                let stateCreateForm = await database.models.forms.findOne({ name: "stateEntityCreateForm" });

                if (!stateCreateForm) {
                    reject({
                        status: httpStatusCode.not_found.status,
                        message: constants.apiResponses.STATE_CREATE_FORM_NOT_FOUND

                    });
                }
                resolve({
                    message: constants.apiResponses.STATE_CREATE_FORM,
                    result: stateCreateForm.value
                })

            } catch (error) {
                return reject({
                    status: error.status || httpStatusCode.internal_server_error.status,
                    message: error.message || httpStatusCode.internal_server_error.message
                });
            }
        });
    }

    /**
       * Create State Entity
       * @method
       * @name createStateEntity
       * @returns {Array} - response consist of created entity information
       */
    static createStateEntity(entityDocument) {
        return new Promise(async (resolve, reject) => {
            try {


                let entityType = await database.models.entityTypes.findOne({ name: constants.common.STATE_ENTITY_TYPE });

                let stateEntityDocument = {
                    entityTypeId: entityType._id,
                    entityType: entityType.name,
                    metaInformation: {
                        name: entityDocument.name,
                        externalId: entityDocument.externalId,
                        capital: entityDocument.capital,
                        region: entityDocument.region
                    }
                }

                let entityDoc = await database.models.entities.create(stateEntityDocument);

                if (!entityDoc) {
                    reject({
                        status: httpStatusCode.bad_request.status,
                        message: constants.apiResponses.FAILED_TO_CREATED_ENTITY
                    });
                }
                resolve({
                    message: constants.apiResponses.ENTITY_CREATED
                })

            } catch (error) {
                return reject({
                    status: error.status || httpStatusCode.internal_server_error.status,
                    message: error.message || httpStatusCode.internal_server_error.message
                });
            }
        });
    }

    /**
    * to get entities Sample Csv
    * @method
    * @name  bulkEntitiesSampleCsvDwonload
    * @returns {json} Response consists of sample csv file information
    */

    static bulkEntitiesSampleCsvDwonload(token) {
        return new Promise(async (resolve, reject) => {
            try {

              
               let fileInfo = {
                sourcePath: constants.common.SAMPLE_ENTITIES_CSV,
                bucket:process.env.STORAGE_BUCKET,
                cloudStorage:process.env.CLOUD_STORAGE,
               }

                let response = await kendrService.getDownloadableUrls(fileInfo, token);
                resolve(response);
            } catch (error) {
                console.log("error", error);
                return reject(error);
            }
        })
    }

    /**
    * to get Entity Mapping Sample Csv
    * @method
    * @name  bulkEntityMappingSampleCsvDwonload
    * @returns {json} Response consists of sample csv file information
    */

   static bulkEntityMappingSampleCsvDwonload(token) {
    return new Promise(async (resolve, reject) => {
        try {

          
           let fileInfo = {
            sourcePath: constants.common.SAMPLE_ENTITY_MAPPING_CSV,
            bucket:process.env.STORAGE_BUCKET,
            cloudStorage:process.env.CLOUD_STORAGE,
           }

            let response = await kendrService.getDownloadableUrls(fileInfo, token);

            resolve(response);
        } catch (error) {
            console.log("error", error);
            return reject(error);
        }
    })
}

    


    /**
    * to get state list.
    * @method
    * @name  stateList
    * @returns {json} Response consists state list
    */

   static stateList() {
    return new Promise(async (resolve, reject) => {
        try {

            let stateInfo = await database.models.entities.find(
                {
                    entityType: constants.common.STATE_ENTITY_TYPE
                },
                {
                    entityTypeId: 1,
                    _id: 1,
                    metaInformation: 1,
                    groups: 1,
                    childHierarchyPath: 1
                }
            ).lean();

            if(!stateInfo){
                reject({ 
                    message:constants.apiResponses.STATES_NOT_FOUND, 
                    status: httpStatusCode.bad_request.status
                });
            }
            let states = [];
            await Promise.all(stateInfo.map(async function (state) {
                states.push({
                    label: state.metaInformation.name,
                    value: state._id
                });
            }));

            if (states) {
                states = states.sort(gen.utils.sortArrayOfObjects('label'));
            }

            
            resolve({ message:constants.apiResponses.STATE_LIST_FETCHED,result:states });

        } catch (error) {
            return reject(error);
        }
    })
}




}


/**
   * 
   * @method
   * @name _subEntityListColumns
   * @returns {json} - User columns data
*/
function _subEntityListColumns() {

    let columns = [
        'externalId',
        'name',
        // 'label',
        'address',
        'actions'
    ];

    let defaultColumn = {
        "type": "column",
        "visible": true
    }

    let result = [];

    for (let column = 0; column < columns.length; column++) {
        let obj = { ...defaultColumn };
        let field = columns[column];

        obj["label"] = gen.utils.camelCaseToCapitalizeCase(field);
        obj["key"] = field

        if (field === "actions") {
            obj["type"] = "action";
            obj["actions"] = _actions();
        }

        result.push(obj);

    }
    return result;
}

/**
   * 
   * @method
   * @name _entityListColumns
   * @returns {json} - User columns data
*/
function _entityListColumns() {

    let columns = [
        'externalId',
        'name',
        'createdAt',
        'subEntities',
        'actions'
    ];

    let defaultColumn = {
        "type": "column",
        "visible": true
    }

    let result = [];

    for (let column = 0; column < columns.length; column++) {
        let obj = { ...defaultColumn };
        let field = columns[column];

        obj["label"] = gen.utils.camelCaseToCapitalizeCase(field);
        obj["key"] = field

        if (field === "actions") {
            obj["type"] = "action";
            obj["actions"] = _actions();
        }

        result.push(obj);

    }
    return result;
}

/**
   * User columns action data.
   * @method
   * @name _actions 
   * @returns {json}
*/

function _actions() {

    let actions = ["view"];
    let actionsColumn = [];

    for (let action = 0; action < actions.length; action++) {
        actionsColumn.push({
            key: actions[action],
            label: gen.utils.camelCaseToCapitalizeCase(actions[action]),
            visible: true,
            icon: actions[action]
        })
    }

    return actionsColumn;
}

