/**
 * name : user-creation.js
 * author : Rakesh Kumar
 * created-date : 18-March-2020
 * Description : User creation and related information.
 */

const userCreationHelper = require(MODULES_BASE_PATH + "/user-creation/helper.js");

/**
    * PlatformUserRoles
    * @class
*/

module.exports = class PlatformUserRoles {
  
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

  constructor() {}

  static get name() {
    return "user-creation";
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
     * @api {get} /admin/api/v1/user-creation/getForm 
     * Get platform user profile information.
     * @apiVersion 1.0.0
     * @apiGroup User
     * @apiHeader {String} X-authenticated-user-token Authenticity token
     * @apiSampleRequest /admin/api/v1/user-creation/getForm
     * @apiUse successBody
     * @apiUse errorBody
     * @apiParamExample {json} Response:
  */

   /**
   * Get user-creation form
   * @method
   * @name getForm
   * @param  {req}  - requested data.
   * @returns {json} Response consists of user creation form
   */

  getForm(req) {
    return new Promise(async (resolve, reject) => {

      try {

        let getUserForm = await userCreationHelper.getForm();
       
        return resolve(getUserForm);

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



    /**
     * @api {get} /admin/api/v1/user-creation/create 
     * to create user 
     * @apiVersion 1.0.0
     * @apiGroup User
     * @apiHeader {String} X-authenticated-user-token Authenticity token
     * @apiSampleRequest /admin/api/v1/user-creation/create
     * @apiUse successBody
     * @apiUse errorBodyuser
     * @apiParamExample {json} Response:
  */

   /**
   * create User
   * @method
   * @name create
   * @param  {req}  - requested data.
   * @returns {json} Response consists of created user details
   */

  create(req) {
    return new Promise(async (resolve, reject) => {

      try {

        let getUserForm = await userCreationHelper.create(req);
       
        return resolve(getUserForm);

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