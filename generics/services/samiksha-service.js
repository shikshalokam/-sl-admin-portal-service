/**
 * name : samiksha-service.js
 * author : Rakesh Kumar
 * Date : 4-June-2020
 * Description : All samiksha service related api call.
 */

//dependencies

let urlPrefix =
    process.env.SAMIKSHA_SERIVCE_HOST +
    process.env.SAMIKSHA_SERIVCE_BASE_URL +
    process.env.URL_PREFIX;

const request = require('request');
const fs = require('fs');


/**
 * entiies bulk upload 
 * @name uploadFileToCloud
 * @param {*} filePath filePath of the file to upload
 * @param {*} token user access token
 * @param {*} type type of entity
 */
function bulkUploadEntities(filePath, token, type) {
    return new Promise(async (resolve, reject) => {
        try {


            let formData = {
                entities: fs.createReadStream(filePath)
            }
            let apiUrl =
                urlPrefix + constants.endpoints.BULK_ENTITY+"?type=" + type;

            let response = await httpCall(apiUrl, token, formData);
            resolve(response);

        } catch (error) {
            return reject(error);
        }
    })
}

/**
 * entiies bulk mapping upload 
 * @name entityMapping
 * @param {*} filePath filePath of the file to upload
 * @param {*} token user access token
 * @param {*} programId Program External ID.
 * @param {*} solutionId Solution External ID.
 */
function entityMapping(filePath,token,programId,solutionId) {

    return new Promise(async (resolve, reject) => {
        try {

            let formData = {
                entityMap: fs.createReadStream(filePath)
            }
            let apiUrl =
                urlPrefix + constants.endpoints.BULK_ENTITY_MAPPING+"?programId=" + programId + "&solutionId="+solutionId;

            let response = await httpCall(apiUrl, token, formData);

            resolve(response);

        } catch (error) {
            return reject(error);
        }
    })
 }


 /**
 * Common http request call 
 * @name httpCall
 * @param {*} url filePath of the file to upload
 * @param {*} token user access token
 * @param {*} formData form data of the request
 */
function httpCall(url, token, formData) {
    return new Promise(async (resolve, reject) => {
        try {

            let options = {
                "headers": {
                    'Content-Type': "application/json",
                    "X-authenticated-user-token": token,
                    "internal-access-token": process.env.INTERNAL_ACCESS_TOKEN
                },
                formData: formData
            };

            let apiUrl = url;
            request.post(apiUrl, options, callback);
            function callback(err, data) {
                if (err) {
                    return reject({
                        message: constants.apiResponses.SAMIKSHA_SERVICE_DOWN
                    });
                } else {
                    return resolve(data);
                }
            }
        } catch (error) {
            return reject(error);
        }
    })
}

module.exports = {
    bulkUploadEntities: bulkUploadEntities,
    entityMapping: entityMapping

};