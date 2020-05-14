/**
 * name : bulkUploadRequest.js
 * author : Rakesh Kumar
 * created-date : 13-May-2020
 * Description : bulk upload operations 
 */

const bulkUploadHelper = require(MODULES_BASE_PATH + "/bulk-upload-request/helper.js");
 
  /**
     * Forms
     * @class
 */
module.exports = class PlatformRolesExt extends Abstract {
    constructor() {
      super(schemas["bulkUploadRequest"]);
    }
  
    static get name() {
      return "bulkUploadRequest";
    }

    /**
     * @api {get} /admin-service/api/v1/bulkUploadRequest/bulkUserUpload 
     * Upload bulk user Upload
     * @apiVersion 1.0.0
     * @apiGroup Bulk Upload
     * @apiHeader {String} X-authenticated-user-token Authenticity token
     * @apiSampleRequest /admin-service/api/v1/bulkUploadRequest/bulkUserUpload
     * @apiUse successBody
     * @apiUse errorBodyuser
    */

  /**
   * bulk User Upload
   * @method
   * @name bulkUserUpload
   * @param  {req}  - requested data.
   * @returns {json} Response consists of created user details
  */

 bulkUserUpload(req) {
  return new Promise(async (resolve, reject) => {
    try {


      // console.log("req.files",req.files);
      if (!req.files || !req.files.userCreationFile) {
        throw { 
            status: httpStatusCode["bad_request"].status, 
            message: httpStatusCode["bad_request"].message 
        };
      } 

      let uploadRequest = await bulkUploadHelper.bulkUserUpload(req,req.userDetails.userId);
      
      

      return resolve(uploadRequest);
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
     * @api {get} /admin-service/api/v1/bulkUploadRequest/list 
     * Upload bulk user Upload
     * @apiVersion 1.0.0
     * @apiGroup Bulk Upload
     * @apiHeader {String} X-authenticated-user-token Authenticity token
     * @apiSampleRequest /admin-service/api/v1/bulkUploadRequest/list
     * @apiUse successBody
     * @apiUse errorBodyuser
    */

  /**
   * to get list of bulk upload request
   * @method
   * @name list
   * @param  {req}  - requested data.
   * @returns {json} Response consists of created user details
  */

 list(req) {
  return new Promise(async (resolve, reject) => {
    try {

      let list = await bulkUploadHelper.list(req.userDetails.userId,
        req.searchText,
        req.pageSize,
        req.pageNo);
      return resolve(list);

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
     * @api {get} /admin-service/api/v1/bulkUploadRequest/details 
     * Upload bulk user Upload
     * @apiVersion 1.0.0
     * @apiGroup Bulk Upload
     * @apiHeader {String} X-authenticated-user-token Authenticity token
     * @apiSampleRequest /admin-service/api/v1/bulkUploadRequest/details
     * @apiUse successBody
     * @apiUse errorBodyuser
    */

  /**
   * to get details of the upload request
   * @method
   * @name details
   * @param  {req}  - requested data.
   * @returns {json} Response consists of request details
  */

 details(req) {
  return new Promise(async (resolve, reject) => {
    try {

      let details = await bulkUploadHelper.details(req.params._id);
      return resolve(details);

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
  