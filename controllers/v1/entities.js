/**
 * name : entities.js
 * author : Rakesh Kumar
 * created-date : 19-march-2020
 * Description : All entities related information.
 */


/**
 * dependencies
 */

const entitiesHelper = require(MODULES_BASE_PATH + "/entities/helper.js");
const csvFileStream = require(ROOT_PATH + "/generics/file-stream");

/**
    * Entities
    * @class
*/

module.exports = class Entities extends Abstract {

  constructor() {
    super(schemas["entities"]);
  }

  /**
   * @apiDefine errorBody
   * @apiError {String} status 4XX,5XX
   * @apiError {String} message Error
   */

  /**
   * @apiDefine successBody
   *  @apiSuccess {String} status 200
   * @apiSuccess {String} result Data
   */


  static get name() {
    return "entities";
  }


  /**
    * @api {get} /admin-service/api/v1/entities/listByEntityType/:entityType 
    * List of entities based on its type
    * @apiVersion 1.0.0
    * @apiGroup Entities
    * @apiHeader {String} X-authenticated-user-token Authenticity token
    * @apiSampleRequest /admin-service/api/v1/entities/listByEntityType/state
    * @apiUse successBody
    * @apiUse errorBody
    * @apiParamExample {json} Response:
    * {
    * "message": "List of entities fetched successfully",
    * "status": 200,
    * "result": {
    *  "count": 6,
    *  "columns": [
    *      {
    *          "type": "column",
    *          "visible": true,
    *          "label": "External Id",
    *          "key": "externalId"
    *      },
    *      {
    *          "type": "column",
    *          "visible": true,
    *          "label": "Name",
    *          "key": "name"
    *      },
    *      {
    *          "type": "column",
    *          "visible": true,
    *          "label": "Created At",
    *          "key": "createdAt"
    *      },
    *      {
    *          "type": "column",
    *          "visible": true,
    *          "label": "Child Hierarchy Path",
    *          "key": "childHierarchyPath"
    *      },
    *      {
    *          "type": "action",
    *          "visible": true,
    *          "label": "Actions",
    *          "key": "actions",
    *          "actions": [
    *              {
    *                  "key": "view",
    *                  "label": "View",
    *                  "visible": true,
    *                  "icon": "view"
    *              }
    *          ]
    *      }
    *  ],
    *  "data": [
    *      {
    *          "externalId": "Dl",
    *          "name": "New Delhi",
    *          "_id": "5d6609ef81a57a6173a79e78",
    *         "childHierarchyPath": [
    *              "district",
    *              "zone",
    *              "school"
    *          ],
    *          "createdAt": "28th Aug 2019"
    *      },
    *  ]
    * }
    * }
    * 
  **/

  /**
    * List of entities based on its type.
    * @method
    * @name listByEntityType
    * @param  {Request} req request body.
    * @returns {JSON} Returns list of entities
   */

  listByEntityType(req) {

    return new Promise(async (resolve, reject) => {

      try {

        let requestedData = {
          entityType: req.params._id,
          pageSize: req.pageSize,
          pageNo: req.pageNo
        }

        let entityDocuments = await entitiesHelper.listByEntityType(
          requestedData
        );

        return resolve(entityDocuments);

      } catch (error) {

        return reject({
          status: error.status || httpStatusCode.internal_server_error.status,
          message: error.message || httpStatusCode.internal_server_error.message,
          errorObject: error
        })

      }


    })
  }

  /**
   * @api {post} /admin-service/api/v1/entities/subEntityList/:entityId?type=:type&search=:search&page=:page&limit=:limit
   * Get sub entity list for the given entity. 
   * @apiVersion 1.0.0
   * @apiGroup Entities
   * @apiHeader {String} X-authenticated-user-token Authenticity token
   * @apiSampleRequest /admin-service/api/v1/entities/subEntityList/5db173598a8e070bedca6ba1?type=school&search=r&page=1&limit=1
   * @apiUse successBody
   * @apiUse errorBody
   * @apiParamExample {json} Response:
   * {
   * "message": "List of entities fetched successfully",
   * "status": 200,
   * "result": {
   *  "data": [
          {
              "_id": "5db1dd3e8a8e070bedca6bef",
              "entityType": "school",
              "name": "Sachdeva Convent School, Street No.-5 Sangam Vihar (Wazirabad - Jagatpur Road), Delhi",
              "externalId": "1207229",
              "addressLine1": "Street No.-5 Sangam Vihar (Wazirabad - Jagatpur Road)",
              "label": "Sachdeva Convent School, Street No.-5 Sangam Vihar (Wazirabad - Jagatpur Road), Delhi",
              "value": "5db1dd3e8a8e070bedca6bef"
          }
      ],
      "count": 6005
  }
}
}

  /**
    * Get the immediate entities .
    * @method
    * @name subEntityList
    * @param  {Request} req request body.
    * @returns {JSON} Returns list of immediate entities
   */

  subEntityList(req) {

    return new Promise(async (resolve, reject) => {

      if (!(req.params._id || req.body.entities)) {
        return resolve({
          status: httpStatusCode.bad_request.status,
          message: constants.apiResponses.ENTITY_ID_NOT_FOUND
        })
      }

      try {

        let entityDocuments = await entitiesHelper.subEntityList(
          req.body.entities ? req.body.entities : "",
          req.params._id ? req.params._id : "",
          req.query.type ? req.query.type : "",
          req.searchText,
          req.pageSize,
          req.pageNo
        );

        return resolve(entityDocuments);

      } catch (error) {

        return reject({
          status: error.status || httpStatusCode.internal_server_error.status,
          message: error.message || httpStatusCode.internal_server_error.message,
          errorObject: error
        })

      }


    })
  }


  /**
 * @api {get} /admin-service/api/v1/entities/details/:entityId
 * Get entities details information
 * @apiVersion 1.0.0
 * @apiGroup Entities
 * @apiHeader {String} X-authenticated-user-token Authenticity token
 * @apiSampleRequest /admin-service/api/v1/entities/details/5db173598a8e070bedca6ba1
 * @apiUse successBody
 * @apiUse errorBody
 * @apiParamExample {json} Response:
 * {
 * "message": "Entity information fetched successfully",
 * "status": 200,
 * "result": {
    "_id": "5db173598a8e070bedca6ba1",
    "entityTypeId": "5d7a290e6371783ceb11064c",
    "entityType": "state",
    "metaInformation": {
        "externalId": "DL",
        "name": "Delhi",
        "region": "NORTH",
        "capital": "NEW DELHI"
    },
    "updatedBy": "2be2fd94-f25e-4402-8e36-20907b45c650",
    "createdBy": "2be2fd94-f25e-4402-8e36-20907b45c650",
    "updatedAt": "2019-10-24T10:16:44.833Z",
    "createdAt": "2019-10-24T09:48:09.005Z"
  }
}

 /**
  * Entity details.
  * @method
  * @name details
  * @param {Object} req - requested entity information.
  * @param {String} req.params._id - entity id
  * @returns {JSON} - Entity details information.
*/

  details(req) {

    return new Promise(async (resolve, reject) => {

      try {
        let result = await entitiesHelper.details(
          req.params._id
        );
        return resolve(result);

      } catch (error) {

        return reject({
          status: error.status || httpStatusCode.internal_server_error.status,
          message: error.message || httpStatusCode.internal_server_error.message,
          errorObject: error
        })
      }
    })
  }

  /**
* @api {get} /admin-service/api/v1/entities/relatedEntities/:entityId Get Related Entities
* @apiVersion 1.0.0
* @apiName Get Related Entities
* @apiGroup Entities
* @apiSampleRequest /admin-service/api/v1/entities/relatedEntities/5dc9266ce153ef2dc4b8ca48
* @apiUse successBody
* @apiUse errorBody
* @apiParamExample {json} Response:
* {
  "message": "Entity information fetched successfully",
  "status": 200,
  "result": {
      "_id": "5dc9266ce153ef2dc4b8ca48",
      "entityTypeId": "5d15a959e9185967a6d5e8a6",
      "entityType": "school",
      "metaInformation": {
          "externalId": "KAES07",
          "name": "GHPS DEVANGA PET",
          "addressLine1": "",
          "city": "",
          "country": "INDIA"
      },
      "relatedEntities": [
          {
              "_id": "5dc92818e153ef2dc4b8cb4a",
              "entityTypeId": "5d7a290e6371783ceb11064c",
              "entityType": "state",
              "metaInformation": {
                  "externalId": "KA",
                  "name": "Karnataka"
              }
          },
          {
              "_id": "5dc9368ae153ef2dc4b8cb4b",
              "entityTypeId": "5d15a959e9185967a6d5e8ac",
              "entityType": "district",
              "metaInformation": {
                  "externalId": "KA-Bangalore Urban",
                  "name": "Bangalore Urban"
              }
          },
          {
              "_id": "5dc93779e153ef2dc4b8cb4c",
              "entityTypeId": "5d15a959e9185967a6d5e8ab",
              "entityType": "block",
              "metaInformation": {
                  "externalId": "BU- Anekal",
                  "name": "Anekal"
              }
          },
          {
              "_id": "5dc937b6e153ef2dc4b8cb55",
              "entityTypeId": "5d15c4ec03cbf959ccabdd2b",
              "entityType": "cluster",
              "metaInformation": {
                  "externalId": "KA-B01",
                  "name": "Anekal Town",
                  "city": ""
              }
          }
      ]
  }
}
*/

  /**
 * Related entities of the given entity.
 * @method
 * @name relatedEntities
 * @param {Object} req - requested data.
 * @param {String} req.params._id - requested entity id.         
 * @returns {JSON} - response consist of related entity details
 */

  relatedEntities(req) {
    return new Promise(async (resolve, reject) => {

      try {

        let result = await entitiesHelper.relatedEntities(req.params._id);

        return resolve(result);

      } catch (error) {

        return reject({
          status: error.status || httpStatusCode.internal_server_error.status,
          message: error.message || httpStatusCode.internal_server_error.message,
          errorObject: error
        })

      }


    })
  }


  /**
  * @api {get} /admin-service/api/v1/entities/stateCreateForm
  * @apiVersion 1.0.0
  * @apiName Get state create form
  * @apiGroup Entities
  * @apiSampleRequest /admin-service/api/v1/entities/stateCreateForm
  * @apiUse successBody
  * @apiUse errorBody
  * @apiParamExample {json} Response:
  * {
    "message": "State create form fetched succefully",
    "status": 200,
    "result": [
        {
            "field": "name",
            "value": "",
            "visible": true,
            "editable": true,
            "label": "Name",
            "input": "text",
            "validation": [
                {
                    "name": "required",
                    "validator": "required",
                    "message": "Name required"
                },
                {
                    "name": "pattern",
                    "validator": "[^a-zA-Zs:]*",
                    "message": "Please provide a valid name"
                }
            ]
        },
        {
            "field": "externalId",
            "value": "",
            "visible": true,
            "editable": true,
            "label": "External Id",
            "input": "text",
            "validation": [
                {
                    "name": "required",
                    "validator": "required",
                    "message": "External Id required"
                },
                {
                    "name": "pattern",
                    "validator": "[^a-zA-Z0-9s:]*",
                    "message": "Please provide a valid external id"
                }
            ]
        },
        {
            "field": "capital",
            "value": "",
            "visible": true,
            "editable": true,
            "label": "Capital",
            "input": "text",
            "validation": [
                {
                    "name": "required",
                    "validator": "required",
                    "message": "Capital required"
                },
                {
                    "name": "pattern",
                    "validator": "[^a-zA-Zs:]*",
                    "message": "Please provide a valid capital"
                }
            ]
        },
        {
            "field": "region",
            "value": "",
            "visible": true,
            "editable": true,
            "label": "Region",
            "input": "text",
            "validation": [
                {
                    "name": "required",
                    "validator": "required",
                    "message": "Region required"
                },
                {
                    "name": "pattern",
                    "validator": "[^a-zA-Zs:]*",
                    "message": "Please provide a valid region"
                }
            ]
        }
    ]
}
  * 
  **/

  /**
   * Get state create form
   * @method
   * @name stateCreateForm
   * @param {Object} req - requested data.
   * @returns {JSON} - response consist of state create form
   */

  stateCreateForm(req) {
    return new Promise(async (resolve, reject) => {

      try {

        let result = await entitiesHelper.stateCreateForm();

        return resolve(result);

      } catch (error) {

        return reject({
          status: error.status || httpStatusCode.internal_server_error.status,
          message: error.message || httpStatusCode.internal_server_error.message,
          errorObject: error
        })
      }
    })
  }


  /**
 * @api {get} /admin-service/api/v1/entities/createStateEntity
 * @apiVersion 1.0.0
 * @apiName To create state entity
 * @apiGroup Entities
 * @apiSampleRequest /admin-service/api/v1/entities/createStateEntity
 * @apiUse successBody
 * @apiUse errorBody
 * @apiParamExample {json} Response:
 * {
 *  "message": "Entity created successfully",
 *  "status": 200
 * }
 **/

  /**
 * Get state create form
 * @method
 * @name createStateEntity
 * @param {Object} req - requested data.
 * @returns {JSON} - response consist of state create form
 */

  createStateEntity(req) {
    return new Promise(async (resolve, reject) => {

      try {


        let result = await entitiesHelper.createStateEntity(req.body);
        return resolve(result);

      } catch (error) {

        return reject({
          status: error.status || httpStatusCode.internal_server_error.status,
          message: error.message || httpStatusCode.internal_server_error.message,
          errorObject: error
        })
      }
    })
  }


  /**
   * @api {get} /admin-service/api/v1/entities/bulkEntitiesSampleCsvDwonload 
   * Sample csv for bulk entities  
   * @apiVersion 1.0.0
   * @apiGroup Entities
   * @apiHeader {String} X-authenticated-user-token Authenticity token
   * @apiSampleRequest /admin-service/api/v1/entities/bulkEntitiesSampleCsvDwonload
   * @apiUse successBody
   * @apiUse errorBodyuser
   * @apiParamExample {json} Response:
   * {
    "message": "Url's generated successfully",
    "status": 200,
    "result": {
        "filePath": "bulkUploadSamples/users.csv",
        "url": "https://storage.googleapis.com/download/storage/v1/b/sl-dev-storage/o/bulkUploadSamples%2Fusers.csv?generation=1591340672710362&alt=media"
    }
}
  */

  /**
   * Bulk entities sample csv 
   * @method
   * @name bulkEntitiesSampleCsvDwonload
   * @param  {req}  - requested data.
   * @returns {json} Response consists of sample csv info
  */

  bulkEntitiesSampleCsvDwonload(req) {
    return new Promise(async (resolve, reject) => {
      try {

        let sampleCsvFile = await entitiesHelper.bulkEntitiesSampleCsvDwonload(req.userDetails.userToken);
          return resolve(sampleCsvFile);
        } catch (error) {

        return reject({
          status:
            error.status ||
            httpStatusCode["internal_server_error"].status,

          message:
            error.message ||
            httpStatusCode["internal_server_error"].message
        });
      }
    });
  }


   /**
   * @api {get} /admin-service/api/v1/entities/bulkEntityMappingSampleCsvDwonload 
   * Sample csv for bulk entities  
   * @apiVersion 1.0.0
   * @apiGroup Entities
   * @apiHeader {String} X-authenticated-user-token Authenticity token
   * @apiSampleRequest /admin-service/api/v1/entities/bulkEntityMappingSampleCsvDwonload
   * @apiUse successBody
   * @apiUse errorBodyuser
   * @apiParamExample {json} Response:
   * {
    "message": "Url's generated successfully",
    "status": 200,
    "result": {
        "filePath": "bulkUploadSamples/users.csv",
        "url": "https://storage.googleapis.com/download/storage/v1/b/sl-dev-storage/o/bulkUploadSamples%2Fusers.csv?generation=1591340672710362&alt=media"
    }
}
  */

  /**
   * Bulk entity mapping sample csv 
   * @method
   * @name bulkEntityMappingSampleCsvDwonload
   * @param  {req}  - requested data.
   * @returns {json} Response consists of sample csv info
  */

 bulkEntityMappingSampleCsvDwonload(req) {
  return new Promise(async (resolve, reject) => {
    try {

      let sampleCsvFile = await entitiesHelper.bulkEntityMappingSampleCsvDwonload(req.userDetails.userToken);
        return resolve(sampleCsvFile);
      } catch (error) {

      return reject({
        status:
          error.status ||
          httpStatusCode["internal_server_error"].status,

        message:
          error.message ||
          httpStatusCode["internal_server_error"].message
      });
    }
  });
}


  /**
  * @api {get} /admin-service/api/v1/entities/stateList
  * @apiVersion 1.0.0
  * @apiName To get state list
  * @apiGroup Entities
  * @apiSampleRequest /admin-service/api/v1/entities/stateList
  * @apiUse successBody
  * @apiUse errorBody
  * @apiParamExample {json} Response:
  * {
    "message": "State list fetched successfully",
    "status": 200,
    "result": [
        {
            "label": "Punjab",
            "value": "5da829874c67d63cca1bd9d0"
        },
        {
            "label": "Delhi",
            "value": "5db173598a8e070bedca6ba1"
        },
        {
            "label": "Karnataka",
            "value": "5dc92818e153ef2dc4b8cb4a"
        },
        {
            "label": "Uttarakhand",
            "value": "5ddf7d3f47e9260268c958b5"
        }
        
    ]
}
  **/

  /**
 * Get state list
 * @method
 * @name stateList
 * @param {Object} req - requested data.
 * @returns {JSON} - response consist of state list
 */

  stateList(req) {
    return new Promise(async (resolve, reject) => {
      try {

        let stateList = await entitiesHelper.stateList();
        return resolve(stateList);

      } catch (error) {
        return reject({
          status:
            error.status ||
            httpStatusCode["internal_server_error"].status,

          message:
            error.message ||
            httpStatusCode["internal_server_error"].message
        });
      }
    });
  }

}
