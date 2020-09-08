module.exports = (req) => {
 
    let bulkUploadRequestValidator = {

        bulkUpload: function () {
            req.checkQuery('requestType').exists().withMessage("required requestType");
        },
        getDownloadableUrls: function () {
            req.checkParams('_id').exists().withMessage("required requestId");
            req.checkQuery('fileType').exists().withMessage("required fileType");
        }
    }
    if (bulkUploadRequestValidator[req.params.method]) bulkUploadRequestValidator[req.params.method]();
};