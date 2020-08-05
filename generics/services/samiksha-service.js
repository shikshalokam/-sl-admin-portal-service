/**
 * name : samiksha-service.js
 * author : Rakesh Kumar
 * Date : 4-June-2020
 * Description : All samiksha service related api call.
 */

//dependencies

const samikshaServiceBaseURL =
    process.env.SAMIKSHA_SERIVCE_HOST +
    process.env.SAMIKSHA_SERIVCE_BASE_URL +
    process.env.URL_PREFIX;

const request = require('request');
const fs = require('fs');


/**
 * Entiies bulk upload 
 * @name bulkUploadEntities
 * @param {String} filePath - filePath of the file to upload
 * @param {String} token - user access token
 * @param {String} type - type of entity
 * @returns {Json} -  entity data
 */
function bulkUploadEntities(filePath, token, type) {
    return new Promise(async (resolve, reject) => {
        try {
            let formData = {
                entities: fs.createReadStream(filePath)
            }
            let apiUrl =
                samikshaServiceBaseURL + CONSTANTS.endpoints.BULK_ENTITY + "?type=" + type;

            let response = await httpCall(apiUrl, token, formData);
            resolve(response);

        } catch (error) {
            return reject(error);
        }
    })
}

/**
 * Entiies bulk mapping upload 
 * @name entityMapping
 * @param {String} filePath filePath of the file to upload
 * @param {String} token user access token
 * @param {String} programId Program External ID.
 * @param {String} solutionId Solution External ID.
 * @returns {Json} - entity mapping information 
 */
function entityMapping(filePath, token, programId, solutionId) {
    return new Promise(async (resolve, reject) => {
        try {

            let formData = {
                entityMap: fs.createReadStream(filePath)
            }
            let apiUrl =
                samikshaServiceBaseURL + CONSTANTS.endpoints.BULK_ENTITY_MAPPING;
            let response = await httpCall(apiUrl, token, formData);
            return resolve(response);

        } catch (error) {
            return reject(error);
        }
    })
}


/**
* Common http request call 
* @name httpCall
* @param {String} url filePath of the file to upload
* @param {String} token user access token
* @param {Json} formData form data of the request
* @returns {Json} - consists of api response body
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
                        message: CONSTANTS.apiResponses.SAMIKSHA_SERVICE_DOWN
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