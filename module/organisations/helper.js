/**
 * name : organisations/helper.js
 * author : Rakesh Kumar
 * Date : 19-March-2020
 * Description : All platform organisation related information.
 */

let sunBirdService =
    require(ROOT_PATH + "/generics/services/sunbird");

module.exports = class platFormUserProfileHelper {

    /**
   * Get platform organisations list.
   * @method
   * @name list
    * @returns {json} Response consists of organisations.
   */

    static list(token, userId, pageSize, pageNo) {
        return new Promise(async (resolve, reject) => {
            try {


                let profileData = await _checkUserAdminAccess(token, userId);

                if (profileData && profileData.allowed) {
                    if (profileData.result.response.organisations) {
                        let orgList = profileData.result.response.organisations;
                        let organisationsList = [];
                        await Promise.all(orgList.map(async function (orgInfo) {
                            cassandraDatabase.models.organisation.findOne({ id: orgInfo.organisationId },
                                { raw: true }, async function (err, result) {
                                    let orgDetails = { value: orgInfo.organisationId, label: result.orgname };
                                    organisationsList.push(orgDetails);

                                    if (organisationsList.length == orgList.length) {
                                        organisationsList = organisationsList.slice((pageNo - 1) * pageSize, pageNo * pageSize);
                                        return resolve({ result: organisationsList, message: constants.apiResponses.ORG_INFO_FETCHED });
                                    }
                                });
                        }));
                    } else {
                        return resolve({
                            status: httpStatusCode["bad_request"].status,
                            message: constants.apiResponses.NO_ORG_FOUND
                        });
                    }
                } else {
                    return resolve({
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
   * Get platform organisations list.
   * @method
   * @name list
    * @returns {json} Response consists of organisations.
   */

    static users(token, userId, organisationId, pageSize, pageNo, searchText,requestedUsers=[]) {
        return new Promise(async (resolve, reject) => {
            try {

                let response;
                let profileData = await _checkUserAdminAccess(token, userId);
                
                if (profileData && profileData.allowed) {

                    if (pageNo) {
                        pageNo = pageNo - 1;
                    }
                    let bodyOfRequest = {
                        "request": {
                            "filters": {
                                "organisations.organisationId": organisationId,
                            },
                            "limit": pageSize,
                            "offset": pageNo
                        }
                    }
                    if (searchText) {
                        bodyOfRequest.request['query'] = searchText;
                    }
                 
                    if(requestedUsers.length > 0){
                        bodyOfRequest.request['filters']["id"] = requestedUsers;
                    }

                    let usersList =
                        await sunBirdService.users(token, bodyOfRequest);

                    if (usersList.responseCode == constants.common.RESPONSE_OK) {

                        let userInfo = [];
                        await Promise.all(usersList.result.response.content.map(function (userItem) {
                            let resultObj = {
                                firstName: userItem.firstName,
                                lastName: userItem.lastName,
                                email: userItem.email,
                                id: userItem.id,
                                address: userItem.address,
                                createdDate: userItem.createdDate,
                                gender: userItem.gender
                            }
                            userInfo.push(resultObj);
                        }));

                        let columns = _userColumn();

                        response = {
                            "result": {
                                count : usersList.result.response.count,
                                columns : columns,
                                data : userInfo
                            },
                            message: constants.apiResponses.USERS_LIST_FETCHED
                        }
                    } else {
                        response = {
                            status: httpStatusCode["bad_request"].status,
                            message: constants.apiResponses.USER_LIST_NOT_FOUND
                        };
                    }

                } else {
                    response = {
                        status: httpStatusCode["bad_request"].status,
                        message: constants.apiResponses.INVALID_ACCESS
                    }
                }
                return resolve(response);

            } catch (error) {
                return reject(error);
            }
        })
    }

     /**
   * Get download userList
   * @method
   * @name list
    * @returns {json} Response consists of users list.
   */

   static downloadUsers(requestBody,token,userId) {
    return new Promise(async (resolve, reject) => {
        try {

            let csvData = await this.users(token, userId, requestBody.organisationId,requestBody.limit,requestBody.page, requestBody.searchText,requestBody.usersList);

            resolve(csvData);

        }
         catch (error) {
            return reject(error);
        }
    });
    }

};


/**
   * check the user has permission for Org odmin or user admin
   * @method
   * @name _checkUserAdminAccess
    * @returns {json} Response consists of profile data and user permission as boolean.
*/

function _checkUserAdminAccess(token, userId) {

    return new Promise(async (resolve, reject) => {
        try {
            let profileInfo =
                await sunBirdService.getUserProfileInfo(token, userId);

            let response;

            let profileData = JSON.parse(profileInfo);
            if (profileData.responseCode == constants.common.RESPONSE_OK) {

                if (profileData.result && profileData.result.response
                    && profileData.result.response.roles) {

                    profileData['allowed'] = false;
                    await Promise.all(profileData.result.response.roles.map(async function (role) {
                        if (constants.common.ORG_ADMIN_ALLOWED_ROLES.includes(role)) {
                            profileData['allowed'] = true;
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
   * 
   * @method
   * @name _userColumn
   * @returns {json} - User columns data
*/

function _userColumn() {

    let columns = [
        'select', 
        'firstName', 
        'lastName', 
        'gender', 
        'role' ,
        'email', 
        'action'
    ];

    let defaultColumn = {
        "type" : "column",
        "visible" : true
    }

    let result = [];

    for( let column = 0 ; column < columns.length ; column++) {
        let obj = {...defaultColumn};
        let field = columns[column];
        
        obj["label"] = gen.utils.camelCaseToCapitalizeCase(field);
        obj["key"] = field

        if( field === "action" ) {
            obj["type"] = "action";
            obj["actions"] = _actions();
        } else if( field === "select" ) {
            obj["key"] = "id";
            obj["visible"] = false;
        }

        result.push(obj);

    }
    return result;
}

/**
   * User columns action data.
   * @method
   * @name _actions 
   * @returns {json}
*/

function _actions() {

    let actions = ["view","edit"];
    let actionsColumn = [];

    for(let action = 0 ; action < actions.length ; action++ ) {
        actionsColumn.push({
            key : actions[action],
            label : gen.utils.camelCaseToCapitalizeCase(actions[action]),
            visible : true,
            icon : actions[action]
        })
    }

    return actionsColumn;
}
