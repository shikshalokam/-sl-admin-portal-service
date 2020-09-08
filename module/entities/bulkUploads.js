/**
 * name : entities/bulkUploads.js
 * author : Rakesh Kumar
 * Date : 07-Sep-2020
 * Description : Consist of bulk upload entity information.
 */

const fs = require("fs");
const samikshaService =
    require(GENERIC_SERVICES_PATH + "/samiksha-service");
const kendraService =
    require(GENERIC_SERVICES_PATH + "/kendra-service");

module.exports = class BulkUploads {

    /**
     * To check weather entity mapping csv is valid or not
     * @name _validateEntityUploadRequest
     * @param {*} inputArray entity mapping csv json
     */
    static validateEntityUploadRequest(inputArray) {
        return new Promise(async (resolve, reject) => {
            let valid = true;
            for (let i = 0; i < inputArray.length; i++) {
                let element = inputArray[i];
                if (element) {
                    if (!element.externalId || !element.state || !element.name || !element.types || !element._existingKeyField) {
                        valid = false;
                    }
                }
                if (valid == false) {
                    break;
                }
            }
            resolve({ success: true, data: valid, message: valid });
        });
    }

    /**
    * Bulk upload entities 
    * @method
    * @name  entitiesUpload
    * @param {String} fileCompletePath - complete file path
    * @param {String} token - user access token
    * @param {String} entityType - type of entity
    * @param {String} userid - user id 
    * @returns {json} Response consist success entity upload response
    **/
    static entitiesUpload(fileCompletePath, token, entityType, userId) {
        return new Promise(async (resolve, reject) => {

            try {

                let samikshaResponse = await samikshaService.bulkUploadEntities(fileCompletePath, token, entityType);
                if (samikshaResponse && samikshaResponse.statusCode == HTTP_STATUS_CODE["ok"].status) {

                    fs.unlink(fileCompletePath);
                    let successFile = UTILS.generateUniqueId() + "_success.csv";
                    fs.writeFileSync(PROJECT_ROOT_DIRECTORY + process.env.BATCH_FOLDER_PATH + successFile, samikshaResponse.body);

                    let uploadResponse = await kendraService.uploadFile(PROJECT_ROOT_DIRECTORY + process.env.BATCH_FOLDER_PATH + successFile,
                        userId + "/" + successFile);
                    fs.unlink(PROJECT_ROOT_DIRECTORY + process.env.BATCH_FOLDER_PATH + successFile);
                    if (uploadResponse.status == HTTP_STATUS_CODE["ok"].status) {
                        resolve({
                            success: true,
                            data: uploadResponse,
                            message: uploadResponse.message
                        });

                    } else {
                        throw new Error(uploadResponse.message);
                    }
                } else {
                    throw new Error(samikshaResponse.body.message);
                }

            } catch (error) {
                reject({
                    success: false,
                    data: false,
                    message: error.message
                })
            }
        });
    }
}