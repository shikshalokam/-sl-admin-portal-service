/**
 * name : entityTypes.js
 * author : Rakesh Kumar
 * created-date : 19-March-2020
 * Description : Entity types information. 
 */

 // Dependencies

 const entityTypesHelper = require(MODULES_BASE_PATH + "/entity-types/helper.js");
//  const bulkUploadHelper = require(MODULES_BASE_PATH + "/bulk-upload-request/helper.js");

  /**
     * EntityTypes
     * @class
 */
 module.exports = class EntityTypes extends Abstract {
   constructor() {
     super(schemas["entityTypes"]);
   }
 
   static get name() {
     return "entityTypes";
   }


/**
    * @api {get} /admin-service/api/v1/entityTypes/list
    * List of entity types
    * @apiVersion 1.0.0
    * @apiGroup EntityTypes
    * @apiHeader {String} X-authenticated-user-token Authenticity token
    * @apiSampleRequest /admin-service/api/v1/entityTypes/list
    * @apiUse successBody
    * @apiUse errorBody
    * @apiParamExample {json} Response:
    {
    "message": "Entity type featched successfully",
    "status": 200,
    "result": [
        {
            "label": "school",
            "value": "5d15a959e9185967a6d5e8a6"
        },
        {
            "label": "parent",
            "value": "5d15a959e9185967a6d5e8a7"
        },
        {
            "label": "teacher",
            "value": "5d15a959e9185967a6d5e8a8"
        },
        {
            "label": "student",
            "value": "5d15a959e9185967a6d5e8a9"
        },
        {
            "label": "schoolLeader",
            "value": "5d15a959e9185967a6d5e8aa"
        },
        {
            "label": "block",
            "value": "5d15a959e9185967a6d5e8ab"
        },
        {
            "label": "district",
            "value": "5d15a959e9185967a6d5e8ac"
        },
        {
            "label": "cluster",
            "value": "5d15c4ec03cbf959ccabdd2b"
        },
        {
            "label": "zone",
            "value": "5d6606ce652f3110440de21b"
        },
        {
            "label": "state",
            "value": "5d7a290e6371783ceb11064c"
        },
        {
            "label": "taluk",
            "value": "5e0ae382df3511bcf705a50f"
        },
        {
            "label": "hub",
            "value": "5e0ae3afdf3511bcf705a53a"
        }
    ]
}
    * 
  **/

/**
 * Get entity type list
 * @method
 * @name list
 * @param {Object} req - requested data.
 * @returns {JSON} - response consist of state list
 */
list(req) {
  return new Promise(async (resolve, reject) => {
    try {

      let entityTypesList = await entityTypesHelper.list();
      return resolve(entityTypesList);

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
 
 };
 