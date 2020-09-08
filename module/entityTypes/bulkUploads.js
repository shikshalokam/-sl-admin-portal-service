/**
 * name : entityTypes/bulkUploads.js
 * author : Rakesh Kumar
 * Date : 07-Sep-2020
 * Description : Consist of bulk upload entity mapping information.
 */

const samikshaService =
    require(GENERIC_SERVICES_PATH + "/samiksha-service");

const kendraService =
    require(GENERIC_SERVICES_PATH + "/kendra-service");

const fs = require("fs");

const mongoose = require('mongoose');
const { ObjectId } = mongoose.Types;

module.exports = class BulkUploads {


    /**
     * To check weather entity mapping csv is valid or not
     * @name validateEntityMapping
     * @param {*} inputArray entity mapping csv json
     */
    static validateEntityMapping(inputArray) {
        return new Promise(async (resolve, reject) => {

            let valid = true;
            for (let i = 0; i < inputArray.length; i++) {
                let element = inputArray[i];

                if (element) {

                    if (!element.parentEntiyId || ObjectId.isValid(element.parentEntiyId) != true ||
                        !element.childEntityId || ObjectId.isValid(element.childEntityId) != true) {
                        valid = false;
                    }
                }
                if(valid==false){
                    break;
                }
            }
            resolve({ success: true, data: valid, message: valid });
        });
    }

    /**
    * Bulk upload entity mapping  
    * @method
    * @name  _entityMapping
    * @param {String} filePath - complete file path
    * @param {String} userToken - user access token
    * @param {String} userid - user id 
    * @returns {json} Response consist request entity mapping details
    **/
    static entityMapping(
        filePath,
        userToken,
        userId) {
        return new Promise(async (resolve, reject) => {

            try {
                let samikshaResponse = await samikshaService.entityMapping(filePath, userToken);
                if (samikshaResponse && samikshaResponse.statusCode == HTTP_STATUS_CODE["ok"].status) {

                    let successFile = UTILS.generateUniqueId() + "_success.csv";
                    let uploadResponse = await kendraService.uploadFile(filePath,
                        userId + "/" + successFile);

                    fs.unlink(filePath);
                    if (uploadResponse.status == HTTP_STATUS_CODE["ok"].status) {

                        return resolve({
                            success: true,
                            data: uploadResponse,
                            message: uploadResponse.message
                        });

                    } else {
                        throw new Error(uploadResponse.message);
                    }
                } else {
                    fs.unlink(filePath);
                    throw new Error(samikshaResponse.body.message);
                }
            } catch (error) {
                return reject({
                    success: false,
                    data: false,
                    message: error.message
                })
            }
        });
    }
}