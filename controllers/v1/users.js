/**
 * name : users.js
 * author : Rakesh Kumar
 * created-date : 18-March-2020
 * Description : User creation and related information.
 */

const usersHelper = require(MODULES_BASE_PATH + "/users/helper.js");
const csvFileStream = require(ROOT_PATH + "/generics/file-stream");

/**
    * Users
    * @class
*/

module.exports = class Users extends Abstract {

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


  constructor() {
    super(schemas["userExtension"]);
  }

  static get name() {
    return "Users";
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
    * @api {get} /admin-service/api/v1/users/getForm/:userId 
    * Get user creation form.
    * @apiVersion 1.0.0
    * @apiGroup Users
    * @apiHeader {String} X-authenticated-user-token Authenticity token
    * @apiSampleRequest /admin-service/api/v1/users/getForm/8f6d6fd2-c069-41f1-b94d-ad2befcc964b
    * @apiUse successBody
    * @apiUse errorBody
    * @apiParamExample {json} Response:
    * 
    *   {
    * "message" : "User creation form fetched successfully",
    * "status": 200,
    * "result": {
    * "form": [
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
  * Get user creation form
  * @method
  * @name getForm
  * @param  {req}  - requested data.
  * @returns {json} Response consists of user creation form
  */

  getForm(req) {
    return new Promise(async (resolve, reject) => {
      try {

        let getUserForm =
          await usersHelper.getForm(
            req.params._id ? req.params._id : req.userDetails.userId,
            req.userDetails.userToken,

          );
        return resolve(getUserForm);

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
   * @api {post} /admin-service/api/v1/users/create 
   * To create the user 
   * @apiVersion 1.0.0
   * @apiGroup Users
   * @apiHeader {String} X-authenticated-user-token Authenticity token
   * @apiSampleRequest /admin-service/api/v1/users/create
   * {
   *   "firstName":"test",
   *   "lastName":"test",
   *   "email":"testUser12333@gmail.com",
   *   "phoneNumber":"1234567890",
   *   "userName":"testUser33@1234",
   *   "state":{
   *      "label":"Karnataka",
   *      "value":"5d6609ef81a57a6173a79e7a"
   *   },
   *   "organisation":{
   *      "label":"ShikshaLokamDev",
   *      "value":"0125747659358699520"
   *    },
	 *  "roles":[
   *   {
   *      "label":"ORG_ADMIN",
   *      "value":"ORG_ADMIN"
   *   }
   *  ],
   * "dateofbirth":"1994-0-01"
   * }
   * @apiUse successBody
   * @apiUse errorBody
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

        let getUserForm =
          await usersHelper.create(
            req.body,
            req.userDetails.userToken
          );
        return resolve(getUserForm);

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
  * @api {POST} /admin-service/api/v1/users/update 
  * To update user details
  * @apiVersion 1.0.0
  * @apiGroup Users
  * @apiHeader {String} X-authenticated-user-token Authenticity token
  * @apiSampleRequest /admin-service/api/v1/users/update
  * @apiUse successBody
  * @apiUse errorBody
  * @apiParamExample {json} Response:
 */

  /**
   * update User
   * @method
   * @name create
   * @param  {req}  - requested data.
   * @returns {json} Response consists updated user details
  */

  update(req) {
    return new Promise(async (resolve, reject) => {
      try {

        let getUserForm =
          await usersHelper.update(
            req.body,
            req.userDetails.userToken
          );
        return resolve(getUserForm);

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
  * @api {get} /admin-service/api/v1/users/activate/:userid
  * To activate the user 
  * @apiVersion 1.0.0
  * @apiGroup Users
  * @apiHeader {String} X-authenticated-user-token Authenticity token
  * @apiSampleRequest /admin-service/api/v1/users/activate/a082787f-8f8f-42f2-a706-35457ca6f1fd
  * @apiUse successBody
  * @apiUse errorBody
  * @apiParamExample {json} Response:
  * 
  * {
  *  "message": "User activated successfully",
  *  "status": 200,
  *  "result": {
  *     "response": "SUCCESS"
  *  }
  * }
  * 
 */

  /**
   * To activate the user 
   * @method
   * @name activate
   * @param  {req}  - requested data.
   * @returns {json} Response consists activate details
  */
  activate(req) {
    return new Promise(async (resolve, reject) => {
      try {

        let updateUserData =
          await usersHelper.activate(req.params._id,
            req.userDetails.userToken
          );
        return resolve(updateUserData);

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
* @api {get} /admin-service/api/v1/users/inactivate/:userid
* To inActivate the user 
* @apiVersion 1.0.0
* @apiGroup Users
* @apiHeader {String} X-authenticated-user-token Authenticity token
* @apiSampleRequest /admin-service/api/v1/users/inactivate/a082787f-8f8f-42f2-a706-35457ca6f1fd
* @apiUse successBody
* @apiUse errorBody
* @apiParamExample {json} Response:
* 
* {
*  "message": "User deactivated successfully",
*  "status": 200,
*  "result": {
*     "response": "SUCCESS"
*  }
* }
* 
*/

  /**
   * To inActivate the user 
   * @method
   * @name inactivate
   * @param  {req}  - requested data.
   * @returns {json} Response consists in-activate details
  */
  inactivate(req) {
    return new Promise(async (resolve, reject) => {
      try {

        let updateUserData =
          await usersHelper.inactivate(req.params._id,
            req.userDetails.userToken
          );
        return resolve(updateUserData);

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
     * @api {get} /admin-service/api/v1/users/details 
     * To get the user details
     * @apiVersion 1.0.0
     * @apiGroup Users
     * @apiHeader {String} X-authenticated-user-token Authenticity token
     * @apiSampleRequest /admin-service/api/v1/users/details/:id
     * @apiUse successBody
     * @apiUse errorBody
     * @apiParamExample {json} Response:
     * 
     * {
     * "status": 200,
     *  "result": {
     *   "userDeactiveAccess": true,
     *   "firstName": "ManthraHM",
     *   "gender": "Male",
     *   "lastName": "one",
     *   "email": "",
     *   "phoneNumber": null,
     *   "status": 1,
     *   "dob": null,
     *   "lastLoginTime": 0,
     *   "createdDate": "2020-04-22 08:58:19:450+0000",
     *   "organisations": [
     *       {
     *           "label": "Mantra4Change",
     *           "value": "01291096296221081622",
     *           "roles": [
     *               {
     *                   "label": "Assessor",
     *                   "value": "ASSESSOR"
     *               }
     *           ]
     *       }
     *   ],
     *   "roles": [
     *       {
     *           "label": "Announcement Sender",
     *           "value": "ANNOUNCEMENT_SENDER"
     *       }
     *       
     *  ],
     *   "organisationsList": [
     *       {
     *           "label": "aaaa",
     *           "value": "013020074837278720848"
     *       },
     *       {
     *           "label": "Anudip",
     *           "value": "013015694888280064602"
     *       }
     *   ]
     * }
     * }
     * 
    **/



  /**
    * details  
    * @method details
    * @name create
    * @param  {req}  - requested data.
    * @returns {json} Response consists updated user details
   */

  details(req) {
    return new Promise(async (resolve, reject) => {
      try {

        let userDetails =
          await usersHelper.details(
            (req.params._id && req.params._id != "") ? req.params._id : req.userDetails.userId,
            req.userDetails.userToken, req.userDetails.userId
          );

        return resolve(userDetails);

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
     * @api {get} /admin-service/api/v1/users/bulkUploadSampleFile 
     * To download bulk user sample csv
     * @apiVersion 1.0.0
     * @apiGroup Users
     * @apiHeader {String} X-authenticated-user-token Authenticity token
     * @apiSampleRequest /admin-service/api/v1/users/bulkUploadSampleFile
     * @apiUse successBody
     * @apiUse errorBody
    */

  /**
   * Bulk user sample csv 
   * @method
   * @name bulkUploadSampleFile
   * @param  {req}  - requested data.
   * @returns {json} Response consists of created user details
  */

 bulkUploadSampleFile(req) {
    return new Promise(async (resolve, reject) => {
      try {

        let sampleCsvFile = await usersHelper.bulkUploadSampleFile();
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

};