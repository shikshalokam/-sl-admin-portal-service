const moment = require("moment");
const entityTypesHelper = require(MODULES_BASE_PATH + "/entityTypes/helper");
const kendraService =
    require(GENERIC_SERVICES_PATH + "/kendra-service");
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
    * @param {String} searchText - search text
    * @returns {Array} - returns an array of entities data.
    */
    static entityDocuments(
        findQuery = "all",
        fields = "all",
        skipFields = "none",
        limitingValue = "",
        skippingValue = "",
        sortedData = "",
        searchText = ""
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


                if (searchText !== "") {
                    queryObject["$or"] = [
                        { "metaInformation.name": new RegExp(searchText, 'i') },
                        { "metaInformation.externalId": new RegExp("^" + searchText, 'm') },
                        { "metaInformation.addressLine1": new RegExp(searchText, 'i') },
                        { "metaInformation.addressLine2": new RegExp(searchText, 'i') }
                    ];
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
     * @param {String} data.searchText - search text
     * @returns {Array} - List of all entities based on type.
     */

    static listByEntityType(entityFilter) {
        return new Promise(async (resolve, reject) => {
            try {

                const entityName = "metaInformation.name";
                const entityExternalId = "metaInformation.externalId"
                const createdAt = "createdAt";
                const childHierarchyPath = "childHierarchyPath";
                let projection = [childHierarchyPath, entityName, entityExternalId, createdAt];


                let skippingValue = entityFilter.pageSize * (entityFilter.pageNo - 1);
                
                let entityDocs = await this.entityDocuments({
                    entityType: entityFilter.entityType
                },
                    projection,
                    "none",
                    entityFilter.pageSize,
                    skippingValue,
                    {
                        [entityName]: 1
                    },
                    entityFilter.searchText
                );
                let entityDocuments = entityDocs.data;

                if (entityDocuments.length < 1) {
                    throw {
                        status: HTTP_STATUS_CODE.not_found.status,
                        message: CONSTANTS.apiResponses.ENTITY_NOT_FOUND
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
                    message: CONSTANTS.apiResponses.ENTITIES_FETCHED,
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
 * @param {params} entityId - single entitiy id
 * @param {params} type - sub list entity type. 
 * @param {params} search - search entity data. 
 * @param {params} limit - page limit. 
 * @param {params} pageNo - page no. 
 * @returns {Array} - List of all sub list entities.
 */

    static subEntityList(entityId, type, search, limit, pageNo) {
        return new Promise(async (resolve, reject) => {
            try {

                let result = [];
                let entityQueryObject = {
                    entityId: entityId,
                    type: type,
                    search: search,
                    limit: limit,
                    pageNo: pageNo
                }

                if (entityId !== "") {
                    result = await this.subEntities(
                        entityQueryObject
                    );
                }

                if (result.data && result.data.length > 0) {
                    result.data = result.data.map(data => {

                        let cloneData = { ...data };
                        cloneData['address'] = cloneData.addressLine1;
                        if (cloneData.addressLine1) {
                            delete cloneData.addressLine1;
                        }
                        return cloneData;
                    })
                }

                let columns = _subEntityListColumns();
                resolve({
                    message: CONSTANTS.apiResponses.ENTITIES_FETCHED,
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
* Get sub entities details.
* @method
* @name getSubEntityDetails
* @param {ObjectId} entityId
* @param {String} searchText - search text,
* @param {String} pageSize - maximum limit
* @param {String} pageNo - page number
* @param {String} entityTraversalType - sub entity type
* @returns {Array} - List of all immediateEntities
*/
    static getSubEntityDetails(entityId,
        searchText,
        pageSize,
        pageNo,
        entityTraversalType = ""
    ) {
        return new Promise(async (resolve, reject) => {

            try {
                let projection = [];
                let queryObject = {};


                console.log("entityTraversalType",entityTraversalType);
                if (entityTraversalType != "") {
                    let entityTraversal = `groups.${entityTraversalType}`;

                    console.log("entityTraversal",entityTraversal);
                    projection.push(entityTraversal);
                    queryObject = {
                        _id: entityId,
                        "groups": { $exists: true },
                        [entityTraversal]: { $exists: true }
                    }

                } 
                // else {

                //     queryObject = {
                //         _id: entityId
                //     }
                //     projection = [
                //         "entityType",
                //         "groups"
                //     ];
                // }

                let entityDocs =
                    await this.entityDocuments(
                        queryObject,
                        projection
                    );
                let entitiesDocument = entityDocs.data;

                let immediateEntities = [];
                let immediateEntitiesIds;

                if (entitiesDocument[0] &&
                    entitiesDocument[0].groups &&
                    Object.keys(entitiesDocument[0].groups).length > 0 && entityTraversalType == ""
                ) {

                    let getImmediateEntityTypes =
                        await entityTypesHelper.list({
                            name: entitiesDocument[0].entityType
                        }, ["immediateChildrenEntityType"]
                        );
                    if (getImmediateEntityTypes && getImmediateEntityTypes.result && getImmediateEntityTypes.result.length > 0) {
                        getImmediateEntityTypes = getImmediateEntityTypes.result[0];
                        Object.keys(entitiesDocument[0].groups).forEach(entityGroup => {
                            if (
                                getImmediateEntityTypes.immediateChildrenEntityType &&
                                getImmediateEntityTypes.immediateChildrenEntityType.length > 0 &&
                                getImmediateEntityTypes.immediateChildrenEntityType.includes(entityGroup)
                            ) {
                                immediateEntitiesIds =
                                    entitiesDocument[0].groups[entityGroup];
                            }
                        });
                    }
                }
                else if (entityTraversalType && entitiesDocument[0]) {
                    if (entitiesDocument[0].groups[entityTraversalType].length > 0) {
                        immediateEntitiesIds = entitiesDocument[0].groups[entityTraversalType];
                    }
                }

                if (
                    immediateEntitiesIds &&
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
                if (immediateEntities && immediateEntities.length == 0) {

                    return resolve({ message: CONSTANTS.apiResponses.SUB_ENTITIES_NOT_FOUND, status: HTTP_STATUS_CODE.not_found.status });
                } else {
                    return resolve(immediateEntities);
                }

            } catch (ex) {

            }
        });
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

                let entitiesDocument = await this.getSubEntityDetails(
                    entitiesData.entityId,
                    entitiesData.search,
                    entitiesData.limit,
                    entitiesData.pageNo,
                    entitiesData.type,
                );
                return resolve(entitiesDocument);
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

                let projection = [
                    "metaInformation.externalId",
                    "metaInformation.name",
                    "metaInformation.addressLine1",
                    "metaInformation.addressLine2",
                    "metaInformation.administration",
                    "metaInformation.city",
                    "metaInformation.country",
                    "entityTypeId",
                    "entityType"
                ];


                if (entityDocument && entityDocument.data && entityDocument.data.length == 0) {
                    reject({
                        message: CONSTANTS.apiResponses.ENTITY_NOT_FOUND,
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
                        status: HTTP_STATUS_CODE.bad_request.status,
                        message: CONSTANTS.apiResponses.ENTITY_NOT_FOUND
                    })
                }

                resolve({
                    message: CONSTANTS.apiResponses.ENTITY_INFORMATION_FETCHED,
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
                let projection = [
                    "metaInformation.externalId",
                    "metaInformation.name",
                    "metaInformation.addressLine1",
                    "metaInformation.addressLine2",
                    "metaInformation.administration",
                    "metaInformation.city",
                    "metaInformation.country",
                    "entityTypeId",
                    "entityType"
                ];
                let entityDocs = await this.entityDocuments({ _id: entityId }, projection);

                let entityDocument = entityDocs.data;
                if (entityDocument.length < 1) {
                    throw {
                        status: HTTP_STATUS_CODE.not_found.status,
                        message: CONSTANTS.apiResponses.ENTITY_NOT_FOUND
                    };
                }

                let relatedEntitiesDocs = await this.relatedEntitiesDetails(entityDocument[0]._id, entityDocument[0].entityTypeId, entityDocument[0].entityType, projection);
                let relatedEntities = relatedEntitiesDocs.data;


                _.merge(result, entityDocument[0])
                result["relatedEntities"] = relatedEntities;
                resolve({ message: CONSTANTS.apiResponses.ENTITY_INFORMATION_FETCHED, result: result });

            } catch (error) {
                return reject({
                    status: error.status || HTTP_STATUS_CODE.internal_server_error.status,
                    message: error.message || HTTP_STATUS_CODE.internal_server_error.message
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

                let relatedEntitiesQuery = {};

                if (entityTypeId && entityId && entityType) {
                    relatedEntitiesQuery[`groups.${entityType}`] = entityId;
                    relatedEntitiesQuery["entityTypeId"] = {};
                    relatedEntitiesQuery["entityTypeId"]["$ne"] = entityTypeId;
                } else {
                    throw {
                        status: HTTP_STATUS_CODE.bad_request.status,
                        message: CONSTANTS.apiResponses.MISSING_ENTITYID_ENTITYTYPE_ENTITYTYPEID
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
                    status: error.status || HTTP_STATUS_CODE.internal_server_error.status,
                    message: error.message || HTTP_STATUS_CODE.internal_server_error.message
                });
            }
        })
    }


    /**
       * State create entity form
       * @method
       * @name stateCreationForm
       * @returns {json} - response consist of state create dynamic form
       */
    static stateCreationForm() {
        return new Promise(async (resolve, reject) => {
            try {

                let stateCreationForm = await database.models.forms.findOne({ name: "stateEntityCreateForm" });

                if (!stateCreationForm) {
                    reject({
                        status: HTTP_STATUS_CODE.not_found.status,
                        message: CONSTANTS.apiResponses.STATE_CREATE_FORM_NOT_FOUND

                    });
                }
                resolve({
                    message: CONSTANTS.apiResponses.STATE_CREATE_FORM,
                    result: stateCreationForm.value
                })

            } catch (error) {
                return reject({
                    status: error.status || HTTP_STATUS_CODE.internal_server_error.status,
                    message: error.message || HTTP_STATUS_CODE.internal_server_error.message
                });
            }
        });
    }

    /**
       * Create State Entity
       * @method
       * @name createState
       * @returns {Array} - response consist of created entity information
       */
    static createState(entityDocument) {
        return new Promise(async (resolve, reject) => {
            try {

                let entityType = await database.models.entityTypes.findOne({ name: CONSTANTS.common.STATE_ENTITY_TYPE });

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
                        status: HTTP_STATUS_CODE.bad_request.status,
                        message: CONSTANTS.apiResponses.FAILED_TO_CREATED_ENTITY
                    });
                }
                resolve({
                    message: CONSTANTS.apiResponses.ENTITY_CREATED
                })

            } catch (error) {
                return reject({
                    status: error.status || HTTP_STATUS_CODE.internal_server_error.status,
                    message: error.message || HTTP_STATUS_CODE.internal_server_error.message
                });
            }
        });
    }

    /**
    * To download entities sample Csv
    * @method
    * @name  bulkUploadSampleFile
    * @returns {json} Response consists of sample csv file information
    */

    static bulkUploadSampleFile() {
        return new Promise(async (resolve, reject) => {
            try {


                let fileInfo = {
                    sourcePath: CONSTANTS.common.SAMPLE_ENTITIES_CSV,
                    bucket: process.env.STORAGE_BUCKET,
                    cloudStorage: process.env.CLOUD_STORAGE,
                }

                let response = await kendraService.getDownloadableUrls(fileInfo);
                resolve(response);
            } catch (error) {
                return reject(error);
            }
        })
    }

    /**
    * To download Entity Mapping Sample Csv
    * @method
    * @name  bulkEntityMappingSampleFile
    * @returns {json} Response consists of sample csv file information
    */

    static bulkEntityMappingSampleFile() {
        return new Promise(async (resolve, reject) => {
            try {

                let fileInfo = {
                    sourcePath: CONSTANTS.common.SAMPLE_ENTITY_MAPPING_CSV,
                    bucket: process.env.STORAGE_BUCKET,
                    cloudStorage: process.env.CLOUD_STORAGE,
                }

                let response = await kendraService.getDownloadableUrls(fileInfo);

                resolve(response);
            } catch (error) {
                return reject(error);
            }
        })
    }


    /**
    * To get state list.
    * @method
    * @name  stateList
    * @returns {json} Response consists state list
    */

    static stateList() {
        return new Promise(async (resolve, reject) => {
            try {

                const queryObject = { entityType: CONSTANTS.common.STATE_ENTITY_TYPE };
                const projection = [
                    "metaInformation.name"
                ]

                let stateData = await this.entityDocuments(queryObject, projection);

                if (!stateData && !stateData.data) {
                    reject({
                        message: CONSTANTS.apiResponses.STATES_NOT_FOUND,
                        status: HTTP_STATUS_CODE.bad_request.status
                    });
                }

                let stateInfo = stateData.data;
                let states = [];
                await Promise.all(stateInfo.map(async function (state) {
                    states.push({
                        label: state.metaInformation.name,
                        value: state._id
                    });
                }));

                if (states) {
                    states = states.sort(UTILS.sortArrayOfObjects('label'));
                }
                resolve({ message: CONSTANTS.apiResponses.STATE_LIST_FETCHED, result: states });

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

        obj["label"] = UTILS.camelCaseToCapitalizeCase(field);
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

        obj["label"] = UTILS.camelCaseToCapitalizeCase(field);
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
            label: UTILS.camelCaseToCapitalizeCase(actions[action]),
            visible: true,
            icon: actions[action]
        })
    }

    return actionsColumn;
}

