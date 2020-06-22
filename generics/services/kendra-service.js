/**
 * name : kendra-service.js
 * author : Rakesh Kumar
 * Date : 18-May-2020
 * Description : All kendra service related api call.
 */

//dependencies

let apiBaseUrl =
    process.env.KENDRA_SERIVCE_HOST +
    process.env.KENDRA_SERIVCE_BASE_URL +
    process.env.URL_PREFIX;

const request = require('request');
const fs = require('fs');

/**
 * To upload file to cloud 
 * @name uploadFileToCloud
 * @param {String} filePath filePath of the file to upload
 * @param {String} uploadPath - location of bucket where to upload
 * @param {String} bucketName - name of the bucket
 * @param {String} token - logged in user token
 * @param {String} endpoint - endpoint of the api 
 * @returns {json} - upload file details
 */
function uploadFileToCloud(filePath, uploadPath, bucketName, token, endpoint) {
    return new Promise(async (resolve, reject) => {
        try {
            let options = {
                "headers": {
                    'Content-Type': "application/json",
                    "X-authenticated-user-token": token,
                    "internal-access-token": process.env.INTERNAL_ACCESS_TOKEN
                },
                formData: {
                    filePath: uploadPath,
                    bucketName: bucketName,
                    file: fs.createReadStream(filePath)

                }
            };

            let apiUrl =
                apiBaseUrl + endpoint;

            request.post(apiUrl, options, callback);
            function callback(err, data) {

                if (err) {
                    return reject({
                        message: constants.apiResponses.KENDRA_SERVICE_DOWN
                    });
                } else {
                    return resolve(data.body);
                }
            }
        } catch (error) {
            return reject(error);
        }
    })
}

/**
 * To downloadable Urls for cloud files 
 * @name getDownloadableUrls
 * @param {Json} inputData - cloud storage details
 * @param {String} token - logged in user token
 * @returns {Json} -  api is to get downloadable Urls of files
 */
function getDownloadableUrls(inputData, token) {
    return new Promise(async function (resolve, reject) {
        try {
            let requestBody = {
                filePaths: inputData.sourcePath,
                bucketName: inputData.bucket
            }
            let endpoint = "";
            if (inputData.cloudStorage == constants.common.AWS_SERVICE) {
                endpoint = constants.endpoints.DOWNLOAD_AWS_URL;
            } else if (inputData.cloudStorage == constants.common.GOOGLE_CLOUD_SERVICE) {
                endpoint = constants.endpoints.DOWNLOAD_GCP_URL;
            } else if (inputData.cloudStorage == constants.common.AZURE_SERVICE) {
                endpoint = constants.endpoints.DOWNLOAD_AZURE_URL;
            }
            const apiUrl =
                apiBaseUrl + endpoint;

            let options = {
                "headers": {
                    'Content-Type': "application/json",
                    "X-authenticated-user-token": token
                },
                json: requestBody
            };

            request.post(apiUrl, options, callback);
            function callback(err, data) {
                if (err) {
                    return reject({
                        message: constants.apiResponses.KENDRA_SERVICE_DOWN
                    });
                } else {
                    return resolve(data.body);
                }
            }
        } catch (ex) {
            reject({ status: "failed", mesage: ex });
        }
    });
}


module.exports = {
    uploadFileToCloud: uploadFileToCloud,
    getDownloadableUrls: getDownloadableUrls
};