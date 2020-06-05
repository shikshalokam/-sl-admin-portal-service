/**
 * name : bulk-upload-request/helper.js
 * author : Rakesh Kumar
 * Date : 18-March-2020
 * Description : Consist of bulk upload request information.
 */

let sunBirdService =
    require(ROOT_PATH + "/generics/services/sunbird");
let kendrService =
    require(ROOT_PATH + "/generics/services/kendra-service");

let samikshaService =
    require(ROOT_PATH + "/generics/services/samiksha-service");


const csv = require('csvtojson');
const request = require('request');
var uniqid = require('uniqid');
const ObjectsToCsv = require('objects-to-csv');
const fs = require('fs');
const moment = require("moment");

module.exports = class UserCreationHelper {


    /**
     * to get bulkUserUpload.
     * @method
     * @name  bulkUserUpload
     * @returns {json} Response consists sample csv data
     */

    static bulkUserUpload(req, userId) {
        return new Promise(async (resolve, reject) => {
            try {

                let profileData = await _checkAccess(req.userDetails.userToken, userId);
                if (profileData && profileData['allowed']) {

                    let userCreateData = await csv().fromString(req.files.uploadFile.data.toString());
                    if (req.query.requestType == "entityMapping") {

                    }
                    else if (req.query.requestType == "entityCreation") {
                        if (!req.query.entityType) {
                            reject({
                                status: httpStatusCode["bad_request"].status,
                                message: "Validation failed"
                            })
                        }
                    } else if (req.query.requestType == "userCreation") {

                        let validateUser = await _validateUsers(userCreateData);
                        if (validateUser == false) {
                            reject({
                                status: httpStatusCode["bad_request"].status,
                                message: "Validation failed"
                            })
                        }

                    }else{
                        reject({
                            status: httpStatusCode["bad_request"].status,
                            message:httpStatusCode["bad_request"].message
                        })
                    }



                    let fileName = gen.utils.generateUniqueId() + ".csv";
                    var dir = ROOT_PATH + process.env.BATCH_FOLDER_PATH;
                    if (!fs.existsSync(dir)) {
                        fs.mkdirSync(dir);
                    }

                    let files = [];
                    files.push(userId + "/" + fileName);
                    let fileInfo = {};

                    let fileCompletePath = ROOT_PATH + process.env.BATCH_FOLDER_PATH + fileName;
                    let data = fs.writeFileSync(fileCompletePath, req.files.uploadFile.data);

                    // // let cv = new ObjectsToCsv(userCreateData);
                    // // let successFile = timestamp + "_" + randomNuumber + "_success.csv";
                    // // await cv.toDisk(ROOT_PATH + process.env.BATCH_FOLDER_PATH + successFile);
                    // // files.push(userId + "/" + successFile);

                    // let failureCsv = new ObjectsToCsv(userCreateData);
                    // let failureFile = timestamp + "_" + randomNuumber + "_failure.csv";
                    // await failureCsv.toDisk(ROOT_PATH + process.env.BATCH_FOLDER_PATH + successFile);
                    // files.push(userId + "/" + failureFile);

                    let requestBody = {
                        fileNames: files,
                    }

                    let config = _getCloudUploadConfig();

                    let uploadFileEndPoint = config.uploadFileEndPoint;
                    let storage = config.storage;
                    let bucketName = config.bucketName;

                    let errorFileData = {};
                    let successFileData = {};

                    await Promise.all(files.map(async function (fileData) {
                        let uploadResp = await kendrService.uploadFileToCloud(fileCompletePath,
                            fileData, bucketName, req.userDetails.userToken, uploadFileEndPoint);
                        uploadResp = JSON.parse(uploadResp);
                        if (uploadResp.status != httpStatusCode["ok"].status) {
                            reject(uploadResp);
                        }
                        if (uploadResp.result) {
                            // if (uploadResp.result.name == userId + "/" + successFile) {
                            //     successFileData = {
                            //         sourcePath: uploadResp.result.name,
                            //         cloudStorage: storage,
                            //         bucket: bucketName
                            //     }
                            // } else 
                            if (uploadResp.result.name == userId + "/" + fileName) {

                                fileInfo = {
                                    sourcePath: uploadResp.result.name,
                                    cloudStorage: storage,
                                    bucket: bucketName
                                }

                            }
                            // else if (uploadResp.result.name == userId + "/" + failureFile) {
                            //     errorFileData = {
                            //         sourcePath: uploadResp.result.name,
                            //         cloudStorage: storage,
                            //         bucket: bucketName
                            //     }
                            // }
                        }
                    }));

                    let type = "";
                    if (req.query.requestType) {
                        type = req.query.requestType;
                    }
                    let requestId = uniqid();

                    let doc = {
                        requestId: requestId,
                        requestType: type,
                        userId: userId,
                        inputFile: fileInfo,
                        errorFile: errorFileData,
                        successFile: successFileData,
                        metaInformation: {
                            state:req.query.state,
                            entityType:req.query.entityType 
                        },
                        remarks: ""
                    }
                    let request = await database.models.bulkUploadRequest.create(doc);


                    if (req.body.requestType == "entityCreation") {
                        _bulkUploadEntities(request.requestId, 
                            fileCompletePath, 
                            req.userDetails.userToken, 
                            req.query.entityType, 
                            req.userDetails.userId);
                    }else if (req.query.requestType == "entityMapping") {
                        _entityMapping(request.requestId, 
                            fileCompletePath, 
                            req.userDetails.userToken, 
                            req.userDetails.userId,
                            req.query.programId,
                            req.query.solutionId);
                    }
                    resolve({ result: { requestId: request.requestId }, message: constants.apiResponses.REQUEST_SUBMITTED });

                } else {
                    resolve({
                        status: httpStatusCode["bad_request"].status,
                        message: constants.apiResponses.INVALID_ACCESS
                    });
                }
            } catch (error) {
                return reject(error);
            }
        })
    }


    /**
    * to get request List.
    * @method
    * @name  list
    * @returns {json} Response consists sample csv data
    */
    static list(userId, searchText, pageSize, pageNo, token, status) {
        return new Promise(async (resolve, reject) => {
            try {

                let profileData = await _checkAccess(token, userId);
                if (profileData && profileData['allowed']) {
                    let skip = pageSize * (pageNo - 1);

                    let columns = _bulkRequestList();
                    let query = { deleted: false };
                    if (searchText) {
                        query = { deleted: false, requestId: { $regex: searchText } }
                    }
                    if (status) {
                        query['status'] = status;
                    }

                    let count = await database.models.bulkUploadRequest.countDocuments(query);
                    let request = await database.models.bulkUploadRequest.find(query,
                        {
                            requestId: 1,
                            requestType: 1,
                            inputFile: 1,
                            successFile: 1,
                            errorFile: 1,
                            createdAt: 1,
                            status: 1
                        }, { skip: skip, limit: pageSize }).sort({ _id: -1 }).lean();

                    let responseData = [];
                    await Promise.all(request.map(async function (element) {
                        if (element.createdAt) {
                            element.createdAt = moment(element.createdAt).format("Do MMM YYYY")
                        }
                        if (element.inputFile) {
                            element['inputFileAvailable'] = true;
                            delete element.inputFile;
                        } else {
                            element['inputFileAvailable'] = false;
                        }
                        if (element.successFile) {
                            element['successFileAvailable'] = true;
                            delete element.successFile;
                        } else {
                            element['successFileAvailable'] = false;
                        }
                        if (element.errorFile) {
                            element['errorFileAvailable'] = true;
                            delete element.errorFile;
                        } else {
                            element['errorFileAvailable'] = false;
                        }
                        responseData.push(element);
                    }));

                    resolve({ result: { data: request, count: count, column: columns } });

                } else {
                    resolve({
                        status: httpStatusCode["bad_request"].status,
                        message: constants.apiResponses.INVALID_ACCESS
                    });
                }
            } catch (error) {
                return reject(error);
            }
        })
    }

    /**
   * to get request details.
   * @method
   * @name  list
   * @returns {json} Response consists sample csv data
   */

    static details(token, userId, requestId) {
        return new Promise(async (resolve, reject) => {
            try {

                let profileData = await _checkAccess(token, userId);
                if (profileData && profileData['allowed']) {

                    let requestDoc = await database.models.bulkUploadRequest.findOne({ requestId: requestId });
                    if (requestDoc) {
                        resolve({ result: { data: { requestDoc } } });
                    } else {
                        reject({ status: httpStatusCode["bad_request"].status, message: httpStatusCode["bad_request"].message });
                    }
                } else {
                    resolve({
                        status: httpStatusCode["bad_request"].status,
                        message: constants.apiResponses.INVALID_ACCESS
                    });
                }

            } catch (error) {
                return reject(error);
            }
        })
    }

    /**
    * to get request details.
    * @method
    * @name  getDownloadableUrls
    * @returns {json} Response consists downloadable url
    */

    static getDownloadableUrls(token, requestId, fileType) {
        return new Promise(async (resolve, reject) => {
            try {


                let requestDoc = await database.models.bulkUploadRequest.findOne({ requestId: requestId })

                if (requestDoc) {

                    let fileInfo;
                    if (fileType == "success") {
                        fileInfo = requestDoc.successFile;
                    } else if (fileType == "error") {
                        fileInfo = requestDoc.errorFile;
                    } else {
                        fileInfo = requestDoc.inputFile;
                    }
                    let response = await kendrService.getDownloadableUrls(fileInfo, token);
                    resolve(response);

                } else {
                    resolve({
                        status: httpStatusCode["bad_request"].status
                    });
                }

            } catch (error) {
                return reject(error);
            }
        })
    }






}


/**
* Action column generation 
* @method
* @name  _actions
* @returns {json} Response consist of dynamic table action columns
*/

function _actions() {

    let actions = ["view", "edit"];
    let actionsColumn = [];

    for (let action = 0; action < actions.length; action++) {
        actionsColumn.push({
            key: actions[action],
            label: gen.utils.camelCaseToCapitalizeCase(actions[action]),
            visible: true,
            icon: actions[action]
        })
    }

    return actionsColumn;
}

/**
* Bulk request grid columns 
* @method
* @name  _bulkRequestList
* @returns {json} Response consist of dynamic table columns
**/

function _bulkRequestList() {

    let columns = [
        'select',
        'requestId',
        'requestType',
        'status',
        'createdAt',
        'files'
    ];

    let defaultColumn = {
        "type": "column",
        "visible": true
    }

    let result = [];

    for (let column = 0; column < columns.length; column++) {
        let obj = { ...defaultColumn };
        let field = columns[column];

        obj["label"] = gen.utils.camelCaseToCapitalizeCase(field);
        obj["key"] = field

        if (field === "files") {
            obj["type"] = "action";
            obj["actions"] = _actions();
        } else if (field === "select") {
            // obj['type'] = "checkbox";
            obj["key"] = "id";
            obj["visible"] = false;

        }

        result.push(obj);

    }
    return result;
}

/**
 * to check weather user has ORG_ADMIN or PLATFORM_ADMIN role
 * @name _checkAccess
 * @param {*} token access token of the user
 * @param {*} userId userId
 */
function _checkAccess(token, userId) {

    return new Promise(async (resolve, reject) => {
        try {
            let profileInfo =
                await sunBirdService.getUserProfileInfo(token, userId);

            let response;
            let profileData = JSON.parse(profileInfo);

            let roles;
            if (profileData.result
                && profileData.result.response
                && profileData.result.response.roles) {
                roles = profileData.result.response.roles;
            }

            let userCustomeRole = await database.models.userExtension.findOne({ userId: userId }, { roles: 1 });

            if (userCustomeRole && userCustomeRole.roles && userCustomeRole.roles.length > 0) {
                userCustomeRole.roles.map(customRole => {
                    if (!roles.includes(customRole.code)) {
                        roles.push(customRole.code)
                    }
                })
            }

            if (profileData.responseCode == constants.common.RESPONSE_OK) {

                if (profileData.result && profileData.result.response) {

                    profileData['allowed'] = false;
                    await Promise.all(roles.map(async function (role) {
                        if (role == constants.common.ORG_ADMIN_ROLE ||
                            role == constants.common.PLATFROM_ADMIN_ROLE) {
                            profileData['allowed'] = true;
                            return resolve(profileData);
                        } else {
                            if (profileData.result.response.organisations) {
                                await Promise.all(profileData.result.response.organisations.map(async org => {
                                    if (org.roles.includes(constants.common.ORG_ADMIN_ROLE)) {
                                        profileData['allowed'] = true;
                                    }
                                }))
                            }
                            return resolve(profileData);
                        }
                    }));
                    response = profileData;
                } else {

                    response = {
                        status: httpStatusCode["bad_request"].status,
                        message: constants.apiResponses.INVALID_ACCESS
                    };
                }

            } else {
                response = {
                    status: httpStatusCode["bad_request"].status,
                    message: constants.apiResponses.USER_INFO_NOT_FOUND
                };
            }

            return resolve(response);
        } catch (error) {
            return reject(error);
        }
    })
}


/**
 * to check weather user creation is valid or not
 * @name _validateUsers
 * @param {*} inputArray user json
 */
function _validateUsers(inputArray) {
    return new Promise(async (resolve, reject) => {

        let valid = true;
        await Promise.all(inputArray.map(async function (element) {
            if (element) {

                let keys = Object.keys(element);
                if (element.EMAIL) {
                    var re = /^[_A-Za-z0-9-\\+]+(\\.[_A-Za-z0-9-]+)*@[A-Za-z0-9-]+(\\.[A-Za-z0-9]+)*(\\.[A-Za-z]{2,})$/;
                    let result = re.test(String(element.EMAIL).toLowerCase());
                    if (result == false) {
                        valid = false;
                    }
                }
                else if (element.name) {

                    var re = /^[a-zA-Z0-9]+$/;
                    let result = re.test(String(element.name).toLowerCase());
                    if (result == false) {
                        valid = false;
                    }

                } else if (element.roles) {

                } else if (element.phone) {

                    var re = /^[(0/91)?[7-9][0-9]{9}]$/;
                    let result = re.test(String(element.phone).toLowerCase());
                    if (result == false) {

                        console.log("phone failed")
                        valid = false;
                    }

                } else {
                    valid = false;
                }
            }
        }));
        resolve(valid);
    });


}

function _bulkUploadEntities(bulkRequestId, fileCompletePath, token, entityType, userId) {
    return new Promise(async (resolve, reject) => {

        let samikshaResponse = await samikshaService.bulkUploadEntities(fileCompletePath, token, entityType);
        if (samikshaResponse && samikshaResponse.statusCode == httpStatusCode["ok"].status) {
            let responseData = await csv().fromString(samikshaResponse.body.toString());
            let config = _getCloudUploadConfig();
            let files = [];
            let cv = new ObjectsToCsv(responseData);
            let successFile = gen.utils.generateUniqueId() + "_success.csv";
            await cv.toDisk(ROOT_PATH + process.env.BATCH_FOLDER_PATH + successFile);
            files.push(userId + "/" + successFile);

            let uploadResponse = await kendrService.uploadFileToCloud(ROOT_PATH + process.env.BATCH_FOLDER_PATH + successFile,
                userId + "/" + successFile, config.bucketName, token, config.uploadFileEndPoint);

            uploadResponse = JSON.parse(uploadResponse);

            if (uploadResponse.status == httpStatusCode["ok"].status) {

                console.log("entites created succefully");

                let successFileData = {
                    sourcePath: uploadResponse.result.name,
                    cloudStorage: config.storage,
                    bucket: config.bucketName
                }
                let update = await database.models.bulkUploadRequest.findOneAndUpdate(
                    { requestId: bulkRequestId },
                    { $set: { "successFile": successFileData, status: "completed" } }
                )
                resolve();

            } else {

                let update = await database.models.bulkUploadRequest.findOneAndUpdate(
                    { requestId: bulkRequestId },
                    { $set: { status: "failed" } }
                )
                resolve();

            }
        }
    });
}


/**
   * To get cloud configaraton
   * @method
   * @name _getCloudUploadConfig 
   * @returns {json} return the cloud configaraton
*/
function _getCloudUploadConfig() {

    let config = {
        bucketName: "",
        uploadFileEndPoint: "",
        storage: ""

    };

    if (process.env.CLOUD_STORAGE == constants.common.AWS_SERVICE) {
        config.bucketName = process.env.STORAGE_BUCKET;
        config.uploadFileEndPoint = constants.endpoints.UPLOAD_TO_AWS;
        config.storage = constants.common.AWS_SERVICE;

    } else if (process.env.CLOUD_STORAGE == constants.common.GOOGLE_CLOUD_SERVICE) {

        config.bucketName = process.env.STORAGE_BUCKET;
        config.uploadFileEndPoint = constants.endpoints.UPLOAD_TO_GCP;
        config.storage = constants.common.GOOGLE_CLOUD_SERVICE;

    } else if (process.env.CLOUD_STORAGE == constants.common.AZURE_SERVICE) {

        config.bucketName = process.env.STORAGE_BUCKET;
        config.uploadFileEndPoint = constants.endpoints.UPLOAD_TO_AZURE;
        config.storage = constants.common.AZURE_SERVICE;
    }

    return config;
}


/**
   * User columns action data.
   * @method
   * @name _actions 
   * @returns {json}
*/
function _entityMapping(bulkRequestId, 
    filePath, 
    userToken, 
    userId,
    programId = "",
    solutionId = "") {
    return new Promise(async (resolve, reject) => {
       
        let samikshaResponse = await samikshaService.entityMapping(filePath, userToken, programId,solutionId);
        if (samikshaResponse && samikshaResponse.statusCode == httpStatusCode["ok"].status) {

            let update = await database.models.bulkUploadRequest.findOneAndUpdate(
                { requestId: bulkRequestId },
                { $set: { status: "completed" } }
            );
            resolve();

        } else {

            let update = await database.models.bulkUploadRequest.findOneAndUpdate(
                { requestId: bulkRequestId },
                { $set: { status: "failed" } }
            )
            resolve();

        }

    });
}