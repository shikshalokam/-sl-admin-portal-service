/**
 * name : bulk-upload-request/helper.js
 * author : Rakesh Kumar
 * Date : 18-March-2020
 * Description : Consist of User creation and user related information.
 */

let sunBirdService =
    require(ROOT_PATH + "/generics/services/sunbird");
let kendrService =
    require(ROOT_PATH + "/generics/services/kendra-service")

const csv = require('csvtojson');
const request = require('request');



const fs = require('fs');

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
                    let configData = await csv().fromString(req.files.userCreationFile.data.toString());

                    let randomNuumber = Math.floor(Math.random() * (100000 - 1) + 1);
                    var timestamp = Math.floor(new Date() / 1000);
                    let fileName = timestamp + "_" + randomNuumber + ".csv";
                    var dir = ROOT_PATH + process.env.BATCH_FOLDER_PATH;
                    if (!fs.existsSync(dir)) {
                        fs.mkdirSync(dir);
                    }


                    let files = [];
                    files.push(userId+"/"+fileName);
                    let fileInfo = { };

                    let fileCompletePath = ROOT_PATH + process.env.BATCH_FOLDER_PATH + fileName;
                    let data = fs.writeFileSync(fileCompletePath, req.files.userCreationFile.data);

                    let requestBody = {
                        fileNames: files,
                    }
                    let endPoint =  "";
                    if(process.env.CLOUD_STORAGE== constants.common.AWS_SERVICE){
                        requestBody['bucket'] = process.env.AWS_STORAGE_BUCKET;
                        endPoint = constants.endpoints.AWS_PRESIGNED_URL;

                    }else if(process.env.CLOUD_STORAGE== constants.common.GOOGLE_CLOUD_SERVICE){

                        requestBody['bucket'] = process.env.GCP_STORAGE_BUCKET;
                        endPoint =constants.endpoints.GCP_PRESIGNED_URL;
    
                    }else if(process.env.CLOUD_STORAGE== constants.common.AZURE_SERVICE){
                       
                         requestBody['bucket'] = process.env.AZURE_STORAGE_BUCKET;
                        endPoint = constants.endpoints.AZURE_PRESIGNED_URL;
                    }

                    let response = await kendrService.getPreSignedUrl(req.userDetails.userToken, 
                        requestBody,endPoint
                        );
                    if(response.result){
                       
                        let uploadResp  = await _uploadFileToGcp(fileCompletePath,response.result[0].url);
                        fileInfo = {
                            sourcePath:response.result[0].payload.sourcePath,
                            cloudStorage:response.result[0].cloudStorage,
                            bucket:requestBody['bucket']
                        }
                        
                        fs.unlink(fileCompletePath);
                        
                    }else{
                        return reject(response);
                    }
                
                    let type = "user-create";
                    if (req.query.requestType) {
                        type = req.query.requestType;
                    }
                    let doc = {
                        requestType: type,
                        userId: userId,
                        file:fileInfo,
                        metaInformation: {
                            // headers:req.headers,
                            query: req.query
                            // url:r

                        },
                        remarks: ""
                    }

                    let request = await database.models.bulkUploadRequest.create(doc);
                    resolve({ result: { requestId: request._id }, message: constants.apiResponses.REQUEST_SUBMITTED });

                 


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

    static list(userId, searchText, pageSize, pageNo, token) {
        return new Promise(async (resolve, reject) => {
            try {

                let profileData = await _checkAccess(token, userId);
                if (profileData && profileData['allowed']) {
                    let skip = pageSize * (pageNo - 1);

                    let columns = _bulkRequestList();
                    let count = await database.models.bulkUploadRequest.count({});

                    let query = { };
                    if(searchText){
                        query = { $text: { $search: "java coffee shop" } }
                    }

                    let request = await database.models.bulkUploadRequest.find(query, {}, { skip: skip, limit: pageSize });
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

                    let requestDoc = await database.models.bulkUploadRequest.findOne({ _id: requestId });
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






}


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

function _bulkRequestList() {

    let columns = [
        'select',
        'requestType',
        'status',
        'createdAt',
        'actions'
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

        if (field === "actions") {
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
 * to upload file to _uploadFileToGcp
 * @name _uploadFileToGcp
 * @param {*} filePath filePath of the file to upload
 * @param {*} gcp url
 */
function _uploadFileToGcp(filePath, url) {
    return new Promise(async (resolve, reject) => {
        try {

            let options = {
                "headers": {
                    'Content-Type': "multipart/form-data"
                },
                body: fs.createReadStream(filePath)
            };

            request.put(url, options, callback);
            function callback(err, data) {
                if (err) {
                    return reject({
                        message: constants.apiResponses.KENDRA_SERVICE_DOWN
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
