/**
 * name : organisations.js
 * author : Rakesh Kumar
 * created-date : 18-March-2020
 * Description : organisations related information.
 */

const organisationsHelper = require(MODULES_BASE_PATH + "/organisations/helper.js");
const csvFileStream = require(ROOT_PATH + "/generics/file-stream");

/**
    * organisations
    * @class
*/

module.exports = class Organisations extends Abstract {

  constructor() {
    super(schemas["organisation"]);
  }

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
    * @api {get} /admin-service/api/v1/organisations/list 
    * Get platform organisations list.
    * @apiVersion 1.0.0
    * @apiGroup Organisations
    * @apiHeader {String} X-authenticated-user-token Authenticity token
    * @apiSampleRequest /admin-service/api/v1/organisations/list 
    * @apiUse successBody
    * @apiUse errorBody
    * @apiParamExample {json} Response:
    * 
    * {
    *   "message": "Organisation list fetched Successfully",
    *   "status": 200,
    *    "result": [ 
    *     {  
    *         "value": "0125747659358699520",
    *          "label": "ShikshaLokamDev"
    *     }
    *  ]
    * }
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



        let organisationList = await organisationsHelper.list(
          req.userDetails.userToken,
          (req.params._id && req.params._id != "") ? req.params._id : req.userDetails.userId,
          req.pageSize,
          req.pageNo);
        return resolve(organisationList);

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
  * @api {get} /admin-service/api/v1/organisations/users 
  * Get platform users list for organisation.
  * @apiVersion 1.0.0
  * @apiGroup Organisations
  * @apiHeader {String} X-authenticated-user-token Authenticity token
  * @apiSampleRequest /admin-service/api/v1/organisations/users/:organisationId
  * @apiUse successBody
  * @apiUse errorBody
  * @apiParamExample {json} Response:
  * 
  * {
  *   "message": "Organisation list fetched Successfully",
  *   "status": 200,
  *    "result": {
  *      "count": 1,
  *       "usersList": [ {
  *            "lastName": "",
  *             "email": "",
  *             "firstName": "abcd", 
  *          }
  *       ]
  *    }   
  * }
  * 
  * 
*/

  /**
  * Get platform users list for organisation.
  * @method
  * @name list
  * @param  {req}  - requested data.
  * @returns {json} Response consists of platform organisation list
  */

  users(req) {
    return new Promise(async (resolve, reject) => {
      try {

        let organisationList = await organisationsHelper.users(
          req.userDetails.userToken,
          req.userDetails.userId,
          req.params._id,
          req.pageSize,
          req.pageNo,
          req.searchText,
          req.query.status ? req.query.status : ""
           );
        return resolve(organisationList);

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
 * @api {get} /admin-service/api/v1/organisations/downloadUsers/:organisationId 
 * Get csv download users list for organisation.
 * @apiVersion 1.0.0
 * @apiGroup Organisations
 * @apiHeader {String} X-authenticated-user-token Authenticity token
 * @apiSampleRequest /admin-service/api/v1/organisations/downloadUsers/:organisationId
 * @apiUse successBody
 * @apiUse errorBody
 * @apiParamExample {json} Response:
 * 
 * 
 * 
*/

  /**
  * Get Download users list for organisation.
  * @method
  * @name list
  * @param  {req}  - requested data.
  * @returns {json} Response consists of csv downladable file
  */

  downloadUsers(req) {
    return new Promise(async (resolve, reject) => {
      try {
        let csvData = await organisationsHelper.downloadUsers(
          req.body,
          req.userDetails.userToken,
          req.userDetails.userId,
        );

        const fileName = `users-list`;
        let fileStream = new csvFileStream(fileName);
        let input = fileStream.initStream();

        if (csvData) {
          csvData.map(async userMap => {
            input.push(userMap);
          })
        }else{
          return resolve(csvData);
        }

        return resolve({
          isResponseAStream: true,
          fileNameWithPath: fileStream.fileNameWithPath()
        });

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
  * @api {get} /admin-service/api/v1/organisations/addUser 
  * To add User to the organisation.
  * @apiVersion 1.0.0
  * @apiGroup Organisations
  * @apiHeader {String} X-authenticated-user-token Authenticity token
  * @apiSampleRequest /admin-service/api/v1/organisations/addUser
  * {
  *   "userId":"",
  *   "organisationId":"",
  *   "roles":["ASSESSOR"]
  * }
  * 
  * 
  * 
  * @apiUse successBody
  * @apiUse errorBody
  * @apiParamExample {json} Response:
  * 
  * {
  *  "status": 200,
  *  "message": ""message": "User added to organisation Successfully"
  *      "result": {
  *          "response": "SUCCESS"
  *      }
  *  }
  * }
  * 
  * 
*/

  /**
  * to add user to organisation
  * @method
  * @name addUser
  * @param  {req}  - requested data.
  * @returns {json} Response consists of platform organisation list
  */

 addUser(req) {
  return new Promise(async (resolve, reject) => {
    try {

      let orgDetails = {
        organisationId:req.body.organisationId,
        userId:req.body.userId,
        roles:req.body.roles
      }

     let response = await organisationsHelper.addUser(orgDetails,req.userDetails.userToken);
      return resolve(response);

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
  * @api {get} /admin-service/api/v1/organisations/assignRoles 
  * To assign Roles to the organisation for the user
  * @apiVersion 1.0.0
  * @apiGroup Organisations
  * @apiHeader {String} X-authenticated-user-token Authenticity token
  * @apiSampleRequest /admin-service/api/v1/organisations/assignRoles
  * {
  *   "userId":"",
  *   "organisationId":"",
  *   "roles":["ASSESSOR"]
  * }
  * 
  * 
  * 
  * @apiUse successBody
  * @apiUse errorBody
  * @apiParamExample {json} Response:
  * 
  * {
  *  "status": 200,
  *  "message": ""message": "roles updated to organisation Successfully"
  *      "result": {
  *          "response": "SUCCESS"
  *      }
  *  }
  * }
  * 
  * 
*/

  /**
  * to add roles to organisation
  * @method
  * @name addUser
  * @param  {req}  - requested data.
  * @returns {json} Response consists of platform organisation list
  */

 assignRoles(req) {
  return new Promise(async (resolve, reject) => {
    try {

      let orgDetails = {
        organisationId:req.body.organisationId,
        userId:req.body.userId,
        roles:req.body.roles
      }

     let response = await organisationsHelper.assignRoles(orgDetails,req.userDetails.userToken);
      return resolve(response);

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