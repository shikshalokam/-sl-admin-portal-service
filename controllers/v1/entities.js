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
     * "result": [
     *  {
            "externalId": "AP",
            "name": "Andhra Pradesh",
            "_id": "5e26c2b0d007227fb039d993"
        },
        {
            "externalId": "WB",
            "name": "West Bengal",
            "_id": "5e26c2b0d007227fb039d9a8"
        },
        {
            "externalId": "DL",
            "name": "Delhi",
            "_id": "5db173598a8e070bedca6ba1"
        }
    ]
  }

    */

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
                  entityType : req.params._id,
                  pageSize : req.pageSize,
                  pageNo : req.pageNo
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
     "message": "List of entities fetched successfully",
     "status": 200,
     "result": {
        "data": [
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
  
          if( !(req.params._id || req.body.entities) ) {
            return resolve({
              status :  httpStatusCode.bad_request.status,
              message : constants.apiResponses.ENTITY_ID_NOT_FOUND
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

}

