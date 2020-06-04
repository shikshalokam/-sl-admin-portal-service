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
function bulkUploadEntities(filePath,token,type) {
    return new Promise(async (resolve, reject) => {
        try {

            let options = {
                "headers": {
                    'Content-Type': "application/json",
                    "X-authenticated-user-token": token,
                     "internal-access-token": process.env.INTERNAL_ACCESS_TOKEN
                },
                formData:{
                    entities:fs.createReadStream(filePath)
                }
            };

            

            let apiUrl = 
            urlPrefix + "/entities/bulkCreate?type="+type;

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
    bulkUploadEntities: bulkUploadEntities
    
};