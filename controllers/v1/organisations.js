/**
 * name : organisations.js
 * author : Rakesh Kumar
 * created-date : 18-March-2020
 * Description : organisations related information.
 */

const organisationsHelper = require(MODULES_BASE_PATH + "/organisations/helper.js");

/**
    * organisations
    * @class
*/

module.exports = class organisations {


  constructor() {}

  static get name() {
    return "organisations";
  }

  /**
* @apiDefine errorBody
* @apiError {String} status 4XX,5XX
* @apiError {String} message Error
*/ /**
* @apiDefine successBody
* @apiSuccess {String} status 200
* @apiSuccess {String} result Data
*/

   /**
     * @api {get} /admin/api/v1/organisations/list 
     * Get platform organisations list.
     * @apiVersion 1.0.0
     * @apiGroup Organisations
     * @apiHeader {String} X-authenticated-user-token Authenticity token
     * @apiSampleRequest /admin/api/v1/organisations/list 
     * @apiUse successBody
     * @apiUse errorBody
     * @apiParamExample {json} Response:
  */

   /**
   * Get organisation list
   * @method
   * @name list
   * @param  {req}  - requested data.
   * @returns {json} Response consists of platform organisation list
   */

  list(req) {
    return new Promise(async (resolve, reject) => {
      try {
        let organisationList = await organisationsHelper.list(req.userDetails.userToken);
        return resolve(organisationList);

      } catch(error) {
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