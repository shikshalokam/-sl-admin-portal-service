/**
 * name : kendra-service.js
 * author : Rakesh Kumar
 * Date : 18-May-2020
 * Description : All kendra service related api call.
 */

//dependencies

let urlPrefix =
    process.env.KENDRA_SERIVCE_HOST +
    process.env.KENDRA_SERIVCE_BASE_URL +
    process.env.URL_PREFIX;

const request = require('request');
const fs = require('fs');

/**
 * to upload file to uploadFileToCloud
 * @name uploadFileToCloud
 * @param {*} filePath filePath of the file to upload
 * @param {*} gcp url
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
                urlPrefix + endpoint;

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

/**to downloadable Urls
 * @name getDownloadableUrls
 * @param {*} req 
 *  api is to get downloadable Urls of files
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
                urlPrefix + endpoint;

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