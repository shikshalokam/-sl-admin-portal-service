/**
 * name : bulkUploadRequest/helper.js
 * author : Rakesh Kumar
 * Date : 18-March-2020
 * Description : Consist of bulk upload request information.
 */

const sunbirdService =
    require(GENERIC_SERVICES_PATH+"/sunbird");
const kendraService =
    require(GENERIC_SERVICES_PATH+"/kendra-service");

const samikshaService =
    require(GENERIC_SERVICES_PATH+"/samiksha-service");


const csv = require('csvtojson');
const uniqid = require('uniqid');
const ObjectsToCsv = require('objects-to-csv');
const fs = require('fs');
const moment = require("moment");
const ObjectId = require('mongoose').Types.ObjectId;


module.exports = class UserCreationHelper {


    /**
     * Bulk upload request
     * @method
     * @name  create
     * @param {Request} req - contains upload file
     * @param {String} userId - user id of the uploader
     * @returns {json} Response consists sample request details
     */

    static create(req, userId) {
        return new Promise(async (resolve, reject) => {
            try {

                let profileData = await _checkAccess(req.userDetails.userToken, userId);
                if (profileData && profileData['allowed']) {

                    let uploadFileData = await csv().fromString(req.files.uploadFile.data.toString());
                    let status = "";
                    if (req.query.requestType == "entityMapping") {

                        status = CONSTANTS.common.BULK_ENTITY_MAPPING_TYPE;

                        let validateMapping = await _validateEntityMapping(uploadFileData);
                        if (validateMapping == false) {
                            reject({
                                status: HTTP_STATUS_CODE["bad_request"].status,
                                message: CONSTANTS.apiResponses.VALIDATION_FAILED
                            })
                        }


                    }
                    else if (req.query.requestType == "entityCreation") {

                        status = CONSTANTS.common.BULK_ENTITY_CREATION_TYPE;
                        if (!req.query.entityType) {
                            reject({
                                status: HTTP_STATUS_CODE["bad_request"].status,
                                message: CONSTANTS.apiResponses.VALIDATION_FAILED
                            })
                        }

                        let validateEntityRequest = await _validateEntityUploadRequest(uploadFileData);
                        if (validateEntityRequest == false) {
                            reject({
                                status: HTTP_STATUS_CODE["bad_request"].status,
                                message: CONSTANTS.apiResponses.VALIDATION_FAILED
                            })
                        }


                    } else if (req.query.requestType == "userCreation") {

                        status = CONSTANTS.common.BULK_USER_CREATION_TYPE;
                        let validateUser = await _validateUsers(uploadFileData);
                        if (validateUser == false) {
                            reject({
                                status: HTTP_STATUS_CODE["bad_request"].status,
                                message: CONSTANTS.apiResponses.VALIDATION_FAILED
                            })
                        }

                    } else {
                        reject({
                            status: HTTP_STATUS_CODE["bad_request"].status,
                            message: HTTP_STATUS_CODE["bad_request"].message
                        })
                    }
                    let fileName = UTILS.generateUniqueId() + ".csv";
                    var dir = PROJECT_ROOT_DIRECTORY + process.env.BATCH_FOLDER_PATH;
                    if (!fs.existsSync(dir)) {
                        fs.mkdirSync(dir);
                    }

                    let files = [];
                    files.push(userId + "/" + fileName);
                    let fileInfo = {};

                    let fileCompletePath = PROJECT_ROOT_DIRECTORY + process.env.BATCH_FOLDER_PATH + fileName;
                    let data = fs.writeFileSync(fileCompletePath, req.files.uploadFile.data);
                    let requestBody = {
                        fileNames: files,
                    }
                   
                    let errorFileData = {};
                    let successFileData = {};

                    await Promise.all(files.map(async function (fileData) {
                        let uploadResp = await kendraService.uploadFile(fileCompletePath,
                            fileData, req.userDetails.userToken);
                        if (uploadResp.status != HTTP_STATUS_CODE["ok"].status) {
                            reject(uploadResp);
                        }
                        if (uploadResp.result) {
                            if (uploadResp.result.name == userId + "/" + fileName) {

                                fileInfo = {
                                    sourcePath: uploadResp.result.name
                                }

                            }
                        }
                    }));

                    let requestId = uniqid();
                    let doc = {
                        requestId: requestId,
                        type: status,
                        userId: userId,
                        inputFile: fileInfo,
                        errorFile: errorFileData,
                        successFile: successFileData,
                        metaInformation: {
                            state: req.query.state,
                            entityType: req.query.entityType
                        }
                    }
                    let request = await database.models.bulkUploadRequests.create(doc);


                    if (req.body.requestType == "entityCreation") {
                        _bulkUploadEntities(request.requestId,
                            fileCompletePath,
                            req.userDetails.userToken,
                            req.query.entityType,
                            req.userDetails.userId);
                    } else if (req.query.requestType == "entityMapping") {

                        _entityMapping(request.requestId,
                            fileCompletePath,
                            req.userDetails.userToken,
                            req.userDetails.userId,
                            req.query.programId,
                            req.query.solutionId);
                    }
                    resolve({ result: { requestId: request.requestId }, message: CONSTANTS.apiResponses.REQUEST_SUBMITTED });

                } else {
                    resolve({
                        status: HTTP_STATUS_CODE["bad_request"].status,
                        message: CONSTANTS.apiResponses.INVALID_ACCESS
                    });
                }
            } catch (error) {
                return reject(error);
            }
        })
    }


    /**
    * To get bulk request List.
    * @method
    * @name  list
    * @param {String} userId - user id
    * @param {String} searchText - search query text
    * @param {String} pageNo - page number
    * @param {String} token - logged in user token
    * @param {String} status - status of the bulk upload
    * @param {String} requestType - type of bulk upload request
    * @returns {json} Response consists bulk upload requests
    */
    static list(userId, searchText, pageSize, pageNo, token, status, requestType = "") {
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
                        if (status != "all") {
                            query['status'] = status;
                        }
                    }

                    if (requestType) {
                        if (requestType != "all") {
                            query['type'] = requestType;
                        }
                    }

                    const count = await database.models.bulkUploadRequests.countDocuments(query);
                    let request = await database.models.bulkUploadRequests.find(query,
                        {
                            requestId: 1,
                            type: 1,
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
                        if (element.type) {
                            element['requestType'] = element.type;
                            delete element.type;
                        }

                        responseData.push(element);
                    }));

                    resolve({ result: { data: request, count: count, column: columns } });

                } else {
                    resolve({
                        status: HTTP_STATUS_CODE["bad_request"].status,
                        message: CONSTANTS.apiResponses.INVALID_ACCESS
                    });
                }
            } catch (error) {
                return reject(error);
            }
        })
    }

    /**
    * To get request details.
    * @method
    * @name  details
    * @param {String} token - user access token
    * @param {String} userId - loggedin user id.
    * @param {String} requestId - bulk upload request id.
    * @returns {json} Response consists bulk request details
    */

    static details(token, userId, requestId) {
        return new Promise(async (resolve, reject) => {
            try {

                let profileData = await _checkAccess(token, userId);
                if (profileData && profileData['allowed']) {

                    const requestDetails= await database.models.bulkUploadRequests.findOne({ requestId: requestId });
                    if (requestDetails) {
                        resolve({ result: { data: { requestDetails } } });
                    } else {
                        reject({ status: HTTP_STATUS_CODE["bad_request"].status, message: HTTP_STATUS_CODE["bad_request"].message });
                    }
                } else {
                    resolve({
                        status: HTTP_STATUS_CODE["bad_request"].status,
                        message: CONSTANTS.apiResponses.INVALID_ACCESS
                    });
                }

            } catch (error) {
                return reject(error);
            }
        })
    }

    /**
    * To get request downloadable urls
    * @method
    * @name  getDownloadableUrls
    * @param {String} requestId - bulk upload request id.
    * @param {String} fileType - success,input or failure csv type
    * @returns {json} Response consists downloadable url
    */

    static getDownloadableUrls(requestId, fileType) {
        return new Promise(async (resolve, reject) => {
            try {


                const requestDoc = await database.models.bulkUploadRequests.findOne({ requestId: requestId })

                if (requestDoc) {

                    let fileInfo;
                    if (fileType == "success") {
                        fileInfo = requestDoc.successFile;
                    } else if (fileType == "error") {
                        fileInfo = requestDoc.errorFile;
                    } else {
                        fileInfo = requestDoc.inputFile;
                    }
                    const response = await kendraService.getDownloadableUrls(fileInfo);
                    resolve(response);

                } else {
                    resolve({
                        status: HTTP_STATUS_CODE["bad_request"].status
                    });
                }

            } catch (error) {
                return reject(error);
            }
        });
    }

    /**
    * To get all request status.
    * @method
    * @name  statusList
    * @returns {json} Response consists status list
    */
    static statusList() {
        return new Promise(async (resolve, reject) => {
            try {

                const bulkRequestDocument = await database.models.bulkUploadRequests.distinct("status");

                let status = [];
                if (bulkRequestDocument && bulkRequestDocument.length == 0) {
                    reject({
                        message: CONSTANTS.apiResponses.STATUS_LIST_NOT_FOUND,
                    });
                }
                bulkRequestDocument.map(item => {
                    status.push({ label: UTILS.camelCaseToCapitalizeCase(item), value: item });
                });

                status = status.sort(UTILS.sortArrayOfObjects('label'));
                let allField = _getAllField();
                status.unshift(allField);
                resolve({
                    message: CONSTANTS.apiResponses.STATUS_LIST,
                    result: status
                });

            } catch (error) {
                return reject(error);
            }
        });
    }

    /**
    * To get request types.
    * @method
    * @name  types
    * @returns {json} Response consists of request types
    */
    static types() {
        return new Promise(async (resolve, reject) => {
            try {

                const bulkRequestDocument = await database.models.bulkUploadRequests.distinct("type");

                let requestTypes = [];
                if (bulkRequestDocument && bulkRequestDocument.length == 0) {
                    reject({
                        message: CONSTANTS.apiResponses.BULK_REQUEST_TYPE_NOT_FOUND,
                    });
                }

                bulkRequestDocument.map(item => {
                    requestTypes.push({ label: UTILS.camelCaseToCapitalizeCase(item), value: item });
                });


                requestTypes = requestTypes.sort(UTILS.sortArrayOfObjects('label'));

                let allField = _getAllField();
                requestTypes.unshift(allField);

                resolve({
                    message: CONSTANTS.apiResponses.BULK_REQUEST_TYPE,
                    result: requestTypes
                });

            } catch (error) {
                return reject(error);
            }
        });
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
            label: UTILS.camelCaseToCapitalizeCase(actions[action]),
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

        obj["label"] = UTILS.camelCaseToCapitalizeCase(field);
        obj["key"] = field

        if (field === "files") {
            obj["type"] = "action";
            obj["actions"] = _actions();
        } else if (field === "select") {
            obj["key"] = "id";
            obj["visible"] = false;

        }

        result.push(obj);

    }
    return result;
}

/**
 * To check weather user has ORG_ADMIN or PLATFORM_ADMIN role
 * @name _checkAccess
 * @param {*} token access token of the user
 * @param {*} userId userId
 */
function _checkAccess(token, userId) {

    return new Promise(async (resolve, reject) => {
        try {
            let profileData =
                await sunbirdService.getUserProfileInfo(token, userId);

            let response;
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

            if (profileData && profileData.status == HTTP_STATUS_CODE.ok.status) {

                if (profileData.result && profileData.result.response) {

                    profileData['allowed'] = false;
                    await Promise.all(roles.map(async function (role) {
                        if (role == CONSTANTS.common.ORG_ADMIN_ROLE ||
                            role == CONSTANTS.common.PLATFROM_ADMIN_ROLE) {
                            profileData['allowed'] = true;
                            return resolve(profileData);
                        } else {
                            if (profileData.result.response.organisations) {
                                await Promise.all(profileData.result.response.organisations.map(async org => {
                                    if (org.roles.includes(CONSTANTS.common.ORG_ADMIN_ROLE)) {
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
                        status: HTTP_STATUS_CODE["bad_request"].status,
                        message: CONSTANTS.apiResponses.INVALID_ACCESS
                    };
                }

            } else {
                response = {
                    status: HTTP_STATUS_CODE["bad_request"].status,
                    message: CONSTANTS.apiResponses.USER_INFO_NOT_FOUND
                };
            }

            return resolve(response);
        } catch (error) {
            return reject(error);
        }
    })
}


/**
 * To check weather user creation is valid or not
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

/**
* Bulk upload entities 
* @method
* @name  _bulkUploadEntities
* @param {String} bulkRequestId - bulk upload request id.
* @param {String} fileCompletePath - complete file path
* @param {String} token - user access token
* @param {String} entityType - type of entity
* @param {String} userid - user id 
* @returns {json} Response consist upload request
**/
function _bulkUploadEntities(bulkRequestId, fileCompletePath, token, entityType, userId) {
    return new Promise(async (resolve, reject) => {

        let samikshaResponse = await samikshaService.bulkUploadEntities(fileCompletePath, token, entityType);
        if (samikshaResponse && samikshaResponse.statusCode == HTTP_STATUS_CODE["ok"].status) {
            let responseData = await csv().fromString(samikshaResponse.body.toString());
            let files = [];
            let cv = new ObjectsToCsv(responseData);
            let successFile = UTILS.generateUniqueId() + "_success.csv";
            await cv.toDisk(PROJECT_ROOT_DIRECTORY + process.env.BATCH_FOLDER_PATH + successFile);
            files.push(userId + "/" + successFile);

            let uploadResponse = await kendraService.uploadFile(PROJECT_ROOT_DIRECTORY + process.env.BATCH_FOLDER_PATH + successFile,
                userId + "/" + successFile, token);

            if (uploadResponse.status == HTTP_STATUS_CODE["ok"].status) {

                let successFileData = {
                    sourcePath: uploadResponse.result.name
                }
                let update = await database.models.bulkUploadRequests.findOneAndUpdate(
                    { requestId: bulkRequestId },
                    { $set: { "successFile": successFileData, status: CONSTANTS.common.BULK_UPLOAD_COMPLETE } }
                )
                resolve(update);

            } else {

                let update = await database.models.bulkUploadRequests.findOneAndUpdate(
                    { requestId: bulkRequestId },
                    { $set: { status: CONSTANTS.common.BULK_UPLOAD_FAILURE } }
                )
                resolve(update);

            }
        }
    });
}


/**
* Bulk upload entity mapping  
* @method
* @name  _entityMapping
* @param {String} bulkRequestId - bulk upload request id.
* @param {String} filePath - complete file path
* @param {String} userToken - user access token
* @param {String} userid - user id 
* @param {String} programId - program id  
* @param {String} solutionId - solution id
* @returns {json} Response consist request entity mapping details
**/
function _entityMapping(bulkRequestId,
    filePath,
    userToken,
    userId,
    programId = "",
    solutionId = "") {
    return new Promise(async (resolve, reject) => {

        try {
            let samikshaResponse = await samikshaService.entityMapping(filePath, userToken, programId, solutionId);
            if (samikshaResponse && samikshaResponse.statusCode == HTTP_STATUS_CODE["ok"].status) {


                let successFile = UTILS.generateUniqueId() + "_success.csv";
                let uploadResponse = await kendraService.uploadFile(filePath,
                    userId + "/" + successFile, userToken);

                if (uploadResponse.status == HTTP_STATUS_CODE["ok"].status) {

                    let successFileData = {
                        sourcePath: uploadResponse.result.name
                    }

                    let update = await database.models.bulkUploadRequests.findOneAndUpdate(
                        { requestId: bulkRequestId },
                        { $set: { status: CONSTANTS.common.BULK_UPLOAD_COMPLETE, "successFile": successFileData } }
                    );
                    resolve(update);
                }
            } else {
                let update = await database.models.bulkUploadRequests.findOneAndUpdate(
                    { requestId: bulkRequestId },
                    { $set: { status: CONSTANTS.common.BULK_UPLOAD_FAILURE } }
                )
                resolve(update);
            }
        } catch (error) {
            return reject(error);
        }
    });
}

/**
 * To check weather entity mapping csv is valid or not
 * @name _validateEntityMapping
 * @param {*} inputArray entity mapping csv json
 */
function _validateEntityMapping(inputArray) {
    return new Promise(async (resolve, reject) => {

        let valid = true;
        await Promise.all(inputArray.map(async function (element) {
            if (element) {

                let keys = Object.keys(element);
                if (element.parentEntiyId) {

                    if (ObjectId.isValid(element.parentEntiyId) == false) {
                        valid = false;
                    }
                }
                else if (element.childEntityId) {

                    if (ObjectId.isValid(element.childEntityId) == false) {
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


/**
 * to check weather entity mapping csv is valid or not
 * @name _validateEntityUploadRequest
 * @param {*} inputArray entity mapping csv json
 */
function _validateEntityUploadRequest(inputArray) {
    return new Promise(async (resolve, reject) => {

        let valid = true;
        await Promise.all(inputArray.map(async function (element) {
            if (element) {

                let keys = Object.keys(element);
                if (element.externalId && element.state && element.name && element.types && element._existingKeyField) {

                }
                else {
                    valid = false;
                }
            }
        }));
        resolve(valid);
    });


}

/**
 * to get all field object for dropdown
 * @name _getAllField
 * @returns {json} response consist of all field object
 **/
function _getAllField() {

    let field = {
        label: "All",
        value: "all",
    }

    return field;
}
