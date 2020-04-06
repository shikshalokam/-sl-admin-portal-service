/**
 * name : user-creation.js
 * author : Rakesh Kumar
 * created-date : 18-March-2020
 * Description : User creation and related information.
 */

const userCreationHelper = require(MODULES_BASE_PATH + "/user-creation/helper.js");

/**
    * userCreation
    * @class
*/

module.exports = class userCreation {
  
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
     * @api {get} /admin/api/v1/user-creation/getForm/:userId 
     * User Creation Form.
     * @apiVersion 1.0.0
     * @apiGroup User
     * @apiHeader {String} X-authenticated-user-token Authenticity token
     * @apiSampleRequest /admin/api/v1/user-creation/getForm/8f6d6fd2-c069-41f1-b94d-ad2befcc964b
     * @apiUse successBody
     * @apiUse errorBody
     * @apiParamExample {json} Response:
     * 
     *   {
     *   "status": 200,
     *  "result": {
     *  "form": [
     *       {
     *          "field": "email",
     *           "value": "",
     *          "visible": true,
     *           "editable": true,
     *           "validation": [
     *               {
     *                   "name": "required",
     *                   "validator": "required",
     *                   "message": "Email required"
     *               },
     *               {
     *                   "name": "pattern",
     *                   "validator": "",
     *                   "message": "Please provide a valid Email"
     *               }
     *           ],
     *           "label": "Email",
     *           "input": "text"
     *       },
     *    
     *       {
     *           "field": "userName",
     *           "value": "",
     *           "visible": true,
     *           "editable": true,
     *           "validation": [
     *               {
     *                   "name": "required",
     *                   "validator": "required",
     *                   "message": "User Name required"
     *               },
     *               {
     *                   "name": "pattern",
     *                   "validator": "^[A-Za-z]+$/",
     *                   "message": "Please provide a valid User Name"
     *               }
     *           ],
     *           "label": "User Name",
     *           "input": "text"
     *       }
     *   ],
     *   "stateListWithSubEntities": [
     *       {
     *           "5da829874c67d63cca1bd9d2": [
     *               "district",
     *               "block",
     *               "cluster",
     *               "school"
     *           ]
     *       }
     *   ]
     *   }
     *  }
     **/
    

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

        let getUserForm = 
        await userCreationHelper.getForm(
          req.userDetails.userToken,
          req.params._id ? req.params._id : req.userDetails.userId
        );
       
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
     * {
     *  "message": "User created successfully",
     *  "status": 200,
     *   "result": {
     *   "response": "SUCCESS",
     *   "userId": "f1f36b2b-1fd8-46fb-92a0-69753cee01ba"
     *   }
     *   }
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