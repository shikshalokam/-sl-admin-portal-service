/**
 * name : organisations/helper.js
 * author : Rakesh Kumar
 * Date : 19-March-2020
 * Description : All platform organisation related information.
 */

let sunBirdService =
    require(ROOT_PATH + "/generics/services/sunbird");

module.exports = class OrganisationsHelper {

    /**
   * Get platform organisations list.
   * @method
   * @name list
    * @returns {json} Response consists of organisations.
   */

    static list(token, userId, pageSize, pageNo) {
        return new Promise(async (resolve, reject) => {
            try {


                let profileData = await _getProfileData(token, userId);
                if (profileData) {

                    let organisationsList = [];

                    let roles = profileData.result.response.roles;
                    let userCustomeRole = await database.models.userExtension.findOne({ userId: userId }, { roles: 1 });

                    if (userCustomeRole && userCustomeRole.roles && userCustomeRole.roles.length > 0) {
                        userCustomeRole.roles.map(customRole => {
                            if (!roles.includes(customRole.code)) {
                                roles.push(customRole.code)
                            }
                        })
                    }
                    if (roles.includes(constants.common.PLATFROM_ADMIN_ROLE)) {

                        let organisationsDoc = await cassandraDatabase.models.organisation.findAsync({},
                            { raw: true, select: ["orgname", "id"] });
                        if (organisationsDoc) {
                            await Promise.all(organisationsDoc.map(function (orgInfo) {

                                let orgDetails = {
                                    label: orgInfo.orgname,
                                    value: orgInfo.id
                                }
                                organisationsList.push(orgDetails);
                            }));
                        }

                    } else if (profileData.result.response.organisations) {
                        let orgList = profileData.result.response.organisations;
                        await Promise.all(orgList.map(async function (orgInfo) {
                            if (roles.includes(constants.common.ORG_ADMIN_ROLE) ||
                                orgInfo.roles.includes(constants.common.ORG_ADMIN_ROLE)) {
                                let result = await _getOrganisationDetailsById(orgInfo.organisationId);
                                let orgDetails = { value: orgInfo.organisationId, label: result.orgname };

                                organisationsList.push(orgDetails);
                            }
                        }));

                    }
                    if (organisationsList.length > 0) {
                        organisationsList = organisationsList.slice((pageNo - 1) * pageSize, pageNo * pageSize);

                        let sortedOrganisations = organisationsList.sort(gen.utils.sortArrayOfObjects('label'));

                        return resolve({ result: sortedOrganisations, message: constants.apiResponses.ORG_INFO_FETCHED });

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

    static users(token, userId, organisationId, pageSize, pageNo, searchText, status = "", requestedUsers = []) {
        return new Promise(async (resolve, reject) => {
            try {

                let response;
                let profileData = await _checkUserAdminAccess(token, userId, organisationId);

                let offset = pageSize * (pageNo - 1);
                if (profileData && profileData.allowed) {

                    let bodyOfRequest = {
                        "request": {
                            "filters": {
                                "organisations.organisationId": organisationId,
                            }
                        }
                    }

                    if (pageNo) {
                        bodyOfRequest.request['offset'] = offset;
                    }
                    if (pageSize) {
                        bodyOfRequest.request['limit'] = pageSize;
                    }
                    if (searchText) {
                        bodyOfRequest.request['query'] = searchText;
                    }
                    if (requestedUsers.length > 0) {
                        bodyOfRequest.request['filters']["id"] = requestedUsers;
                    }
                    if (status) {
                        bodyOfRequest.request['filters']['status'] = status;
                    }

                    let usersList =
                        await sunBirdService.users(token, bodyOfRequest);

                    if (usersList.responseCode == constants.common.RESPONSE_OK) {


                        let sunBirdRoles =
                            await cassandraDatabase.models.role.findAsync(
                                {
                                    status: 1
                                }, {
                                select: ["id", "name"], raw: true, allow_filtering: true
                            });

                        let allRoles = {

                        };
                        if (sunBirdRoles) {
                            sunBirdRoles.map(function (sunBirdrole) {
                                allRoles[sunBirdrole.id] = sunBirdrole.name;
                            });
                        }

                        let platformRoles =
                            await database.models.platformRolesExt.find({}, {
                                code: 1,
                                title: 1
                            }).lean();

                        if (platformRoles) {
                            platformRoles.map(function (customRoles) {
                                allRoles[customRoles.code] = customRoles.title;
                            });
                        }


                        let userInfo = [];
                        await Promise.all(usersList.result.response.content.map(async function (userItem) {

                            let rolesOfUser = "";
                            await Promise.all(userItem.organisations.map(async orgInfo => {
                                if (orgInfo.organisationId == organisationId) {

                                    let orgRoles = orgInfo.roles.map(roleItem => {
                                        return allRoles[roleItem]
                                    })
                                    orgRoles = (orgRoles).toString();
                                    if (rolesOfUser == "") {
                                        rolesOfUser = orgRoles;
                                    } else {
                                        rolesOfUser = rolesOfUser + "," + orgRoles
                                    }
                                }
                            }));


                            let gender = userItem.gender == "M" ? "Male" : userItem.gender == "F" ? "Female" : "";

                            let resultObj = {
                                firstName: userItem.firstName,
                                lastName: userItem.lastName,
                                id: userItem.id,
                                gender: gender,
                                role: rolesOfUser,
                                status: userItem.status
                            }
                            userInfo.push(resultObj);
                        }));

                        let columns = _userColumn();

                        response = {
                            "result": {
                                count: usersList.result.response.count,
                                columns: columns,
                                data: userInfo
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

    static downloadUsers(requestBody, token, userId) {
        return new Promise(async (resolve, reject) => {
            try {

                let csvData = await this.users(token, userId, requestBody.organisationId, requestBody.limit, requestBody.page, requestBody.searchText, requestBody.status, requestBody.usersList);
                let responseData = [];
                if (csvData.result && csvData.result.data) {
                    await Promise.all(csvData.result.data.map(fields => {
                        if (fields.id) {
                            delete fields.id;
                        }

                        let status = "";
                        if (fields.status == 1) {
                            status = "Active"
                        } else {
                            status = "Inactive";
                        }
                        fields.status = status;
                        let userInfo = Object.keys(fields).reduce((c, k) => (c[gen.utils.camelCaseToCapitalizeCase(k)] = fields[k], c), {})
                        responseData.push(userInfo);
                    }))
                }

                resolve(responseData);

            }
            catch (error) {
                return reject(error);
            }
        });
    }



    /*
    * addUser.
    * @method
    * @name  addUser
    * @param  {orgnisationInfo,token}  - organisation object and token
    * @returns {json} Response consists of success or failure of the api.
    */
    static addUser(orgnisationInfo, token) {

        return new Promise(async (resolve, reject) => {
            try {
                let response = await sunBirdService.addUser(orgnisationInfo, token);

                if (response && response.responseCode == constants.common.RESPONSE_OK) {
                    resolve({ result: response.result, message: constants.apiResponses.USER_ADDED_TO_ORG });
                } else {
                    reject({ message: response.body });
                }

            } catch (error) {
                return reject(error)
            }

        });
    }



    /*
     * assignRoles.
     * @method
     * @name  addUser
     * @param  {orgnisationInfo,token}  - organisation object and token
     * @returns {json} Response consists of success or failure of the api.
     */
    static assignRoles(orgnisationInfo, token) {

        return new Promise(async (resolve, reject) => {
            try {
                let response = await sunBirdService.assignRoles(orgnisationInfo, token);

                if (response && response.responseCode == constants.common.RESPONSE_OK) {
                    resolve({ result: response.result, message: constants.apiResponses.ASSIGNED_ROLE_SUCCESSFULLY });
                } else {
                    reject({ message: response.body });
                }

            } catch (error) {
                return reject(error)
            }

        });
    }

    /*
     * get organisation list.
     * @method
     * @name  detailList
     * @param  {inputData}  - hold query object
     * @returns {json} Response consists of success or failure of the api.
     */
    static detailList(inputData) {
        return new Promise(async (resolve, reject) => {
            try {

                let profileData = await _getProfileData(inputData.userToken, inputData.userId);
                if (profileData) {

                    let organisationsList = [];
                    let roles = profileData.result.response.roles;
                    let userCustomeRole = await database.models.userExtension.findOne({ userId: inputData.userId }, { roles: 1 });

                    if (userCustomeRole && userCustomeRole.roles && userCustomeRole.roles.length > 0) {
                        userCustomeRole.roles.map(customRole => {
                            if (!roles.includes(customRole.code)) {
                                roles.push(customRole.code)
                            }
                        })
                    }

                    let offset = inputData.pageSize * (inputData.pageNo - 1);
                    if (roles.includes(constants.common.PLATFROM_ADMIN_ROLE)) {
                        let request = {
                            "filters": {
                            },
                            "limit": inputData.pageSize,
                            "offset": offset
                        }

                        if (inputData.searchText) {
                            request['query'] = inputData.searchText;
                        }
                        if (inputData.status) {
                            request['filters']['status'] = inputData.status;
                        }
                        //  console.log("inputData.pageNo",request);

                        let organisationInfo = [];
                        let organisationList = await sunBirdService.searchOrganisation(request, inputData.userToken);
                        if (organisationList.responseCode == constants.common.RESPONSE_OK) {
                            if (organisationList.result && organisationList.result.response &&
                                organisationList.result.response && organisationList.result.response.content) {
                                await Promise.all(organisationList.result.response.content.map(async function (orgInfo) {

                                           let orgDetails = {
                                                organisationName: orgInfo.orgName,
                                                description: orgInfo.description,
                                                _id: orgInfo.id,
                                                noOfMembers:orgInfo.noOfMembers,
                                                externalId:orgInfo.externalId,
                                                status: orgInfo.status == 0 ? "Inactive": "Active" 

                                            }
                                            organisationInfo.push(orgDetails);
                                }));
                            }

                            if(organisationInfo.length > 0){
                                resolve({ result: organisationInfo, message: constants.apiResponses.ORG_INFO_FETCHED })
                            }else{
                                resolve({ result: organisationInfo,message: constants.apiResponses.NO_ORG_FOUND })
                            }
                            
                        } else {
                            resolve({ result: organisationList, message: constants.apiResponses.NO_ORG_FOUND })
                        }
                    }else{
                        reject({  
                             status: httpStatusCode["bad_request"].status,
                             message: constants.apiResponses.INVALID_ACCESS 
                        })
                    }
                } else {
                    return resolve({
                        status: httpStatusCode["bad_request"].status,
                        message: constants.apiResponses.INVALID_ACCESS
                    });
                }
            } catch (error) {
                return reject(error)
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

function _checkUserAdminAccess(token, userId, organisationId) {

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
                                    if (org.organisationId == organisationId
                                        && org.roles.includes(constants.common.ORG_ADMIN_ROLE)) {
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
        'role',
        'status',
        'action'
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

        if (field === "action") {
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
   * User columns action data.
   * @method
   * @name _actions 
   * @returns {json}
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
   * To get Organisation Details By Id.
   * @method
   * @name _getOrganisationDetailsById 
   * @returns {json}
*/

function _getOrganisationDetailsById(orgId) {

    return new Promise(async (resolve, reject) => {

        cassandraDatabase.models.organisation.findOne({ id: orgId },
            { raw: true }, async function (err, result) {
                return resolve(result);
            });

    });

}

/**
 * to get _getProfileData of user
 * @method
 * @name _getProfileData
  * @returns {json} Response consists of profile data a
*/

function _getProfileData(token, userId) {
    return new Promise(async (resolve, reject) => {
        try {
            let profileInfo =
                await sunBirdService.getUserProfileInfo(token, userId);

            let profileData = JSON.parse(profileInfo);
            return resolve(profileData);

        } catch (error) {
            return reject(error);
        }
    });
}


/**
   * 
   * @method
   * @name _organisationColumn
   * @returns {json} - organisation columns data
*/

function _organisationColumn() {

    let columns = [
        'select',
        'organisationName',
        'description',
        'noOfMembers',
        'externalId',
        'status',
        'action'
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

        if (field === "action") {
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
