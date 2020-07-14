/**
 * name : kendra-service.js
 * author : Rakesh Kumar
 * Date : 18-May-2020
 * Description : All kendra service related api call.
 */

//dependencies

const apiBaseUrl =
    process.env.KENDRA_SERIVCE_HOST +
    process.env.KENDRA_SERIVCE_BASE_URL +
    process.env.URL_PREFIX;

const request = require('request');
const fs = require('fs');

/**
 * To upload file to cloud 
 * @name uploadFile
 * @param {String} filePath filePath of the file to upload
 * @param {String} uploadPath - location of bucket where to upload
 * @returns {json} - upload file details
 */
function uploadFile(filePath, uploadPath) {
    return new Promise(async (resolve, reject) => {
        try {
            let options = {
                "headers": {
                    'Content-Type': "application/json",
                    "internal-access-token": process.env.INTERNAL_ACCESS_TOKEN
                },
                formData: {
                    filePath: uploadPath,
                    bucketName: process.env.STORAGE_BUCKET,
                    file: fs.createReadStream(filePath)

                }
            };

             let endpoint = "";

            let cloudStorage = process.env.CLOUD_STORAGE;
            if (cloudStorage == constants.common.AWS_SERVICE) {
                endpoint = constants.endpoints.UPLOAD_TO_AWS;
            } else if (cloudStorage == constants.common.GOOGLE_CLOUD_SERVICE) {
                endpoint = constants.endpoints.UPLOAD_TO_GCP;
            } else if (cloudStorage == constants.common.AZURE_SERVICE) {
                endpoint = constants.endpoints.UPLOAD_TO_AZURE;
            }

            let apiUrl =
                apiBaseUrl + endpoint;

            request.post(apiUrl, options, callback);
            function callback(err, data) {

                if (err) {
                    return reject({
                        message: constants.apiResponses.KENDRA_SERVICE_DOWN
                    });
                } else {
                    return resolve(JSON.parse(data.body));
                }
            }
        } catch (error) {
            reject(error);
        }
    })
}

/**
 * To downloadable Urls for cloud files 
 * @name getDownloadableUrls
 * @param {Json} inputData - cloud storage details
 * @returns {Json} -  api is to get downloadable Urls of files
 */
function getDownloadableUrls(inputData) {
    return new Promise(async function (resolve, reject) {
        try {
            let requestBody = {
                filePaths: inputData.sourcePath,
                bucketName: process.env.STORAGE_BUCKET
            }
            let endpoint = "";
            let cloudStorage = process.env.CLOUD_STORAGE;
            if (cloudStorage == constants.common.AWS_SERVICE) {
                endpoint = constants.endpoints.DOWNLOAD_AWS_URL;
            } else if (cloudStorage == constants.common.GOOGLE_CLOUD_SERVICE) {
                endpoint = constants.endpoints.DOWNLOAD_GCP_URL;
            } else if (cloudStorage == constants.common.AZURE_SERVICE) {
                endpoint = constants.endpoints.DOWNLOAD_AZURE_URL;
            }
            const apiUrl =
                apiBaseUrl + endpoint;

            let options = {
                "headers": {
                    'Content-Type': "application/json",
                    "internal-access-token": process.env.INTERNAL_ACCESS_TOKEN
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
        } catch (error) {
            reject(error);
        }
    });
}



module.exports = {
    uploadFile: uploadFile,
    getDownloadableUrls: getDownloadableUrls
};