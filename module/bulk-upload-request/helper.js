/**
 * name : bulk-upload-request/helper.js
 * author : Rakesh Kumar
 * Date : 18-March-2020
 * Description : Consist of User creation and user related information.
 */

let sunBirdService =
    require(ROOT_PATH + "/generics/services/sunbird");

const csv = require('csvtojson');

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


                    console.log("eq.headers",req);
                    let type ="user-create";
                    if(req.query.requestType){
                        type = req.query.requestType;
                    }
                    let doc = {
                        requestType: type,
                        userId: userId,
                        metaInformation: {
                            // headers:req.headers,
                            query:req.query
                            // url:r

                        },
                        remarks: ""
                    }

                    console.log("doc", doc);
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

    static list(userId, searchText, pageSize, pageNo,token) {
        return new Promise(async (resolve, reject) => {
            try {

                let profileData = await _checkAccess(token, userId);
                if (profileData && profileData['allowed']) {
                    let skip = pageSize * (pageNo - 1);

                    let columns = _bulkRequestList();
                    let count = await database.models.bulkUploadRequest.count({});

                    let request = await database.models.bulkUploadRequest.find({}, {}, { skip: skip, limit: pageSize });
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

    static details(token,userId,requestId) {
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
