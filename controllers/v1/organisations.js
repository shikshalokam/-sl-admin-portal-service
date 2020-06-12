/**
 * name : organisations.js
 * author : Rakesh Kumar
 * created-date : 18-March-2020
 * Description : organisations related information.
 */

const organisationsHelper = require(MODULES_BASE_PATH + "/organisations/helper.js");
const csvFileStream = require(ROOT_PATH + "/generics/file-stream");

/**
    * Organisations
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
        } else {
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
  * To add user to organisation
  * @method
  * @name addUser
  * @param  {req}  - requested data.
  * @returns {json} Response consists of success or failure of the request
  */

  addUser(req) {
    return new Promise(async (resolve, reject) => {
      try {

        let orgDetails = {
          // organisationId: req.body.organisationId,
          userId: req.body.userId,
          roles: req.body.roles,
          organisation:req.body.organisation
        }
        let response = await organisationsHelper.addUser(orgDetails, req.userDetails.userToken);
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
 *   "organisationId":"0125747659358699520",
 *   "roles":["ASSESSOR"]
 * }
 * 
 * @apiUse successBody
 * @apiUse errorBody
 * @apiParamExample {json} Response:
 * 
 * {
 *  "status": 200,
 *  "message": ""message": "User roles added to organisation  successfully"
 *      "result": {
 *          "response": "SUCCESS"
 *      }
 *  }
 * }
 * 
 * 
*/

  /**
  * To assign Roles to the organisation for the user
  * @method
  * @name addUser
  * @param  {req}  - requested data.
  * @returns {json} Response consists of success or failure of the request
  * 
  */

  assignRoles(req) {
    return new Promise(async (resolve, reject) => {
      try {

        let orgDetails = {
          organisationId: req.body.organisationId,
          userId: req.body.userId,
          roles: req.body.roles,
          removeRoles:req.body.removeRoles ? req.body.removeRoles : false
        }
        let response = await organisationsHelper.assignRoles(orgDetails, req.userDetails.userToken);
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
   * @api {get} /admin-service/api/v1/organisations/detailList 
   * To get the organisation list for the user 
   * @apiVersion 1.0.0
   * @apiGroup Organisations
   * @apiHeader {String} X-authenticated-user-token Authenticity token
   * @apiSampleRequest /admin-service/api/v1/organisations/detailList?pageSize=20&pageNo=1
   * @apiUse successBody
   * @apiUse errorBody
   * @apiParamExample {json} Response:
   * 
   * {
   *  "status": 200,
   *  "message": ""message": "Organisation List fetched Successfully"
   *      "result": {
   *          "columns":[{
   *             "type": "column",
   *             "visible": true,
   *             "label": "organisation Name",
   *             "key": "organisationName"
   *         }],
   *         data:[{
   *             organisationName:”Mantra4Change”,
   *             description:”ShikshaLokam Development”,
   *             status:”Active/Inactive”,
   *             noOfMembers::”10”,
   *         }]
   *      }
   *  }
   * }
   * 
   * 
 */

  /**
  * to get organisation list
  * @method
  * @name detailList
  * @param  {req}  - requested data.
  * @returns {json} Response consists of platform organisation list
  */

 detailList(req) {
    return new Promise(async (resolve, reject) => {
      try {

       let query = { 
        userToken:req.userDetails.userToken,
        userId:req.userDetails.userId,
        pageSize:req.pageSize,
        pageNo:req.pageNo,
        searchText:req.searchText,
        status:req.query.status ? req.query.status : "" 
      }
        let response = await organisationsHelper.detailList(query);
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
   * @api {get} /admin-service/api/v1/organisations/create 
   * To create the organisation
   * @apiVersion 1.0.0
   * @apiGroup Organisations
   * @apiHeader {String} X-authenticated-user-token Authenticity token
   * @apiSampleRequest /admin-service/api/v1/organisations/create
   * @apiUse successBody
   * @apiUse errorBody
   * @apiParamExample {json} Response:
   * 
   * {
   *  "status": 200,
   *  "message": ""message": "Organisation List fetched Successfully"
   *      "result": {
   *          "columns":[{
   *             "type": "column",
   *             "visible": true,
   *             "label": "organisation Name",
   *             "key": "organisationName"
   *         }],
   *         data:[{
   *             organisationName:”Mantra4Change”,
   *             description:”ShikshaLokam Development”,
   *             status:”Active/Inactive”,
   *             noOfMembers::”10”,
   *         }]
   *      }
   *  }
   * }
   * 
   * 
 */

  /**
  * to create the organisation
  * @method
  * @name create
  * @param  {req}  - requested data.
  * @returns {json} Response consists of platform organisation list
  */

 create(req) {
  return new Promise(async (resolve, reject) => {
    try {
  
      let response = await organisationsHelper.create(req.body, req.userDetails.userToken);
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
   * @api {get} /admin-service/api/v1/organisations/getForm 
   * Organisation create form
   * @apiVersion 1.0.0
   * @apiGroup Organisations
   * @apiHeader {String} X-authenticated-user-token Authenticity token
   * @apiSampleRequest /admin-service/api/v1/organisations/getForm
   * @apiUse successBody
   * @apiUse errorBody
   * @apiParamExample {json} Response:
   * 
   * {
   *  "status": 200,
   *  "message": ""message": "Organisation List fetched Successfully"
   *      "result": [{
   *         "field": "name",
   *         "value": "",
   *         "visible": true,
   *         "editable": true,
   *         "label": "Name",
   *         "input": "text",
   *         "validation": [
   *             {
   *                 "name": "required",
   *                 "validator": "required",
   *                 "message": "Name required"
   *             },
   *             {
   *                 "name": "pattern",
   *                 "validator": "([a-zA-Z]{3,30}s*)+",
   *                 "message": "Please Provide Valid Name"
   *             }
   *         ]
   *     }]
   * }
   * 
   * 
 */
 /**
  * To get organisation create form
  * @method
  * @name getForm
  * @param  {req}  - requested data.
  * @returns {json} Response consists of organisation create form
  */

 getForm(req) {
  return new Promise(async (resolve, reject) => {
    try {
  
      let response = await organisationsHelper.getForm();
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
   * @api {get} /admin-service/api/v1/organisations/update 
   * To update organisation details
   * @apiVersion 1.0.0
   * @apiGroup Organisations
   * @apiHeader {String} X-authenticated-user-token Authenticity token
   * @apiSampleRequest /admin-service/api/v1/organisations/update
   * {
   *  name:"",
   *  email:"",
   *  description:"",
   *  externalId:"",
   *  organisationId:""
   * }
   * @apiUse successBody
   * @apiUse errorBody
   * @apiParamExample {json} Response:
   * {
   *  "message": "Organisation Created Successfully",
   *  "status": 200,
   *  "result": {
   *     "organisationId": "013014480583598080574",
   *   "response": "SUCCESS"
   *   }
   * }
   * 
 */
 /**
  * to update organisation data
  * @method
  * @name getForm
  * @param  {req}  - requested data.
  * @returns {json} Response consists of organisation create form
  */

 update(req) {
  return new Promise(async (resolve, reject) => {
    try {
  
      let response = await organisationsHelper.update(req.body,req.userDetails.userToken);
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
   * @api {get} /admin-service/api/v1/organisations/details 
   * To get organisation details
   * @apiVersion 1.0.0
   * @apiGroup Organisations
   * @apiHeader {String} X-authenticated-user-token Authenticity token
   * @apiSampleRequest /admin-service/api/v1/organisations/details/:organisationId
   * @apiUse successBody
   * @apiUse errorBody
   * @apiParamExample {json} Response:
   * {
   *  "message": "Organisation Details Fetched Successfully",
   *  "status": 200,
   *  "result": {
   *     "organisationId": "013014480583598080574",
   *     "name": "",
   *     "email":"",
   *     "provider":"",
   *     "externalId":""
   *   }
   * }
   * 
 */
 /**
  * to get organisation details
  * @method
  * @name details
  * @param  {req}  - requested data.
  * @returns {json} Response consists of organisation details
  */

 details(req) {
  return new Promise(async (resolve, reject) => {
    try {
  
      let response = await organisationsHelper.details(req.params._id,req.userDetails.userToken);
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
   * @api {get} /admin-service/api/v1/organisations/updateStatus 
   * To update organisation status
   * @apiVersion 1.0.0
   * @apiGroup Organisations
   * @apiHeader {String} X-authenticated-user-token Authenticity token
   * @apiSampleRequest /admin-service/api/v1/organisations/updateStatus
   * {
   *   "organisationId": "013014480583598080574",
   *   "status":"0"
   * }
   * @apiUse successBody
   * @apiUse errorBody
   * @apiParamExample {json} Response:
   * {
   *  "message": "Organisation Status Update Successfully",
   *  "status": 200,
   *  "result": {
   *     "organisationId": "",
   *   }
   * }
   * 
 */
 /**
  * to update organisation status
  * @method
  * @name updateStatus
  * @param  {req}  - requested data.
  * @returns {json} Response consists updated organisation status
  **/

 updateStatus(req) {
  return new Promise(async (resolve, reject) => {
    try {
  
      let response = await organisationsHelper.updateStatus(req.body,req.userDetails.userToken);
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
   * @api {get} /admin-service/api/v1/organisations/removeUser  
   * To remove User from organisation
   * @apiVersion 1.0.0
   * @apiGroup Organisations
   * @apiHeader {String} X-authenticated-user-token Authenticity token
   * @apiSampleRequest /admin-service/api/v1/organisations/removeUser
   * {
   *   "organisationId": "",
   *   "userId":""
   * }
   * @apiUse successBody
   * @apiUse errorBody
   * @apiParamExample {json} Response:
   * {
   *  "message": "user removed from Organisation Successfully",
   *  "status": 200,
   *  "result": {
   *     "organisationId": "",
   *   }
   * }
   * 
 */
 /**
  * to update organisation status
  * @method
  * @name updateStatus
  * @param  {req}  - requested data.
  * @returns {json} Response consists updated organisation status
  **/

 removeUser(req) {
  return new Promise(async (resolve, reject) => {
    try {
  
      let response = await organisationsHelper.removeUser(req.body,req.userDetails.userToken);
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