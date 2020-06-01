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
 * @apiGroup User
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

}

