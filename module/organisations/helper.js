/**
 * name : organisations/helper.js
 * author : Rakesh Kumar
 * Date : 19-March-2020
 * Description : All platform organisation related information.
 */

let sunBirdService =
    require(ROOT_PATH + "/generics/services/sunbird");

let formsHelper = require(MODULES_BASE_PATH + "/forms/helper");

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

                        // let organisationsDoc = await cassandraDatabase.models.organisation.findAsync({},
                        //     { raw: true, select: ["orgname", "id"] });



                        // if (organisationsDoc) {
                        //     await Promise.all(organisationsDoc.map(function (orgInfo) {

                        //         let orgDetails = {
                        //             label: orgInfo.orgname,
                        //             value: orgInfo.id
                        //         }
                        //         organisationsList.push(orgDetails);
                        //     }));
                        // }

                        let request = {
                            "filters": {
                            }
                        }
                        let organisationList = await sunBirdService.searchOrganisation(request, token);
                        if (organisationList.responseCode == constants.common.RESPONSE_OK) {
                            if (organisationList.result && organisationList.result.response &&
                                organisationList.result.response && organisationList.result.response.content) {
                                await Promise.all(organisationList.result.response.content.map(async function (orgInfo) {
                                    organisationsList.push({
                                        label: orgInfo.orgName,
                                        value: orgInfo.id
                                    });

                                }))
                            }
                        }

                    } else if (profileData.result.response.organisations) {
                        let orgList = profileData.result.response.organisations;
                        await Promise.all(orgList.map(async function (orgInfo) {
                            if (roles.includes(constants.common.ORG_ADMIN_ROLE) ||
                                orgInfo.roles.includes(constants.common.ORG_ADMIN_ROLE)) {
                                let result = await _getOrganisationDetailsById(orgInfo.organisationId, token);
                                let orgDetails = { value: orgInfo.organisationId, label: result.orgName };

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

                    let platformRoles =
                        await database.models.platformRolesExt.find({}, {
                            code: 1,
                            title: 1
                        }).lean();
                    let sunBirdRoles =
                        await cassandraDatabase.models.role.findAsync(
                            {
                                status: 1
                            }, {
                            select: ["id", "name"], raw: true, allow_filtering: true
                        });
                    if (usersList.responseCode == constants.common.RESPONSE_OK) {

                        let allRoles = {};
                        if (sunBirdRoles) {
                            sunBirdRoles.map(function (sunBirdrole) {
                                if (sunBirdrole.id != constants.common.PUBLIC_ROLE) {
                                    allRoles[sunBirdrole.id] = sunBirdrole.name;
                                }

                            });
                        }

                        if (platformRoles) {
                            platformRoles.map(function (customRoles) {
                                allRoles[customRoles.code] = customRoles.title;
                            });
                        }
                        let userInfo = [];
                        await Promise.all(usersList.result.response.content.map(async function (userItem) {

                            let rolesOfUser = "";
                            let customRoles = await database.models.userExtension.findOne({
                                userId: userItem.id
                            }, {
                                roles: 1, organisationRoles: 1
                            })
                            if (customRoles) {
                                if (customRoles.organisationRoles) {
                                    let orgRolesOfUser = [];
                                     customRoles.organisationRoles.map(userRoles=>{
                                         if(organisationId ==userRoles.organisationId){
                                            orgRolesOfUser.push(...userRoles.roles);
                                         }
                                    })

                                    let disctinctRoles =[];
                                    orgRolesOfUser.map(element=>{
                                        if(!disctinctRoles.includes(element.code)){
                                            disctinctRoles.push(element.code);
                                            if (rolesOfUser == "") {
                                                rolesOfUser = allRoles[element.code];
                                            } else {
                                                rolesOfUser = rolesOfUser + "," + allRoles[element.code]
                                            }

                                        }
                                    });
                                }
                            }

                            await Promise.all(userItem.organisations.map(async orgInfo => {
                                if (orgInfo.organisationId == organisationId) {
                                    
                                    
                                    let orgRoles =[];
                                    orgInfo.roles.map(roleItem => {
                                        if(roleItem!="PUBLIC"){
                                               if(allRoles[roleItem]){
                                                orgRoles.push(allRoles[roleItem]);
                                               }
                                        }
                                    });
                                    
                                    orgRoles = (orgRoles).toString();
                                    if (orgRoles) {
                                        if (rolesOfUser == "") {
                                            rolesOfUser = orgRoles;
                                        } else {
                                            rolesOfUser = rolesOfUser + "," + orgRoles
                                        }
                                    }
                                }
                            }));

                            let gender = userItem.gender == "M" ? "Male" : userItem.gender == "F" ? "Female" : "";
                            let status = userItem.status == 1 ? "Active" : "Inactive";

                            let resultObj = {
                                firstName: userItem.firstName,
                                lastName: userItem.lastName,
                                id: userItem.id,
                                gender: gender,
                                role: rolesOfUser,
                                status: status
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

                        // let status = "";
                        // if (fields.status == 1) {
                        //     status = "Active"
                        // } else {
                        //     status = "Inactive";
                        // }
                        // fields.status = status;
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
    static addUser(orgnaisationInfo, token) {

        return new Promise(async (resolve, reject) => {
            try {


                let plaformRoles = [];
                let rolesId = [];


                let rolesDocuments = await database.models.platformRolesExt.find({}, {
                    _id: 1, code: 1, title: 1
                }).lean();


                plaformRoles.push("PUBLIC");
                await Promise.all(orgnaisationInfo.roles.map(async function (roleInfo) {

                    let found = false;
                    await Promise.all(rolesDocuments.map(roleDoc => {
                        if (roleDoc.code === roleInfo) {
                            found = true;
                            let roleObj = {
                                roleId: roleDoc._id,
                                code: roleDoc.code,
                                name: roleDoc.title
                            }
                            rolesId.push(roleObj);
                        }
                    }));

                    if (!found) {
                        if (roleInfo) {
                            plaformRoles.push(roleInfo);
                        }
                    }
                }));


                if (plaformRoles.length == 0) {
                    plaformRoles.push("PUBLIC");
                }
                let orgCreateRequest = {
                    organisationId: orgnaisationInfo.organisation.value,
                    roles: plaformRoles,
                    userId: orgnaisationInfo.userId
                }

                let response = await sunBirdService.addUser(orgCreateRequest, token);

                if (response && response.responseCode == constants.common.RESPONSE_OK) {
                    if (response.result.response == constants.common.SUCCESS_RESPONSE) {
                        let organisationsRoles = [];
                        organisationsRoles.push({ organisationId: orgnaisationInfo.organisation.value, roles: rolesId });

                        let updateUser = await database.models.userExtension.findOneAndUpdate({ userId: orgnaisationInfo.userId },
                            { $push: { organisations: orgnaisationInfo.organisation, organisationRoles: organisationsRoles } });

                            resolve({ result: response.result, message: constants.apiResponses.USER_ADDED_TO_ORG });
                    }else{

                        reject({ result: response.result, status: httpStatusCode["bad_request"].status, 
                        message:constants.apiResponses.FAILED_TO_ADD_USER_TO_ORG });
                    }

                } else {
                    reject({ message: response,status: httpStatusCode["bad_request"].status });
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


                let plaformRoles = [];
                let rolesId = [];

                let rolesDocuments = await database.models.platformRolesExt.find({}, {
                    _id: 1, code: 1, title: 1
                }).lean();

                await Promise.all(orgnisationInfo.roles.map(async function (roleInfo) {

                    let found = false;
                    await Promise.all(rolesDocuments.map(roleDoc => {
                        if (roleDoc.code === roleInfo) {
                            found = true;
                            let roleObj = {
                                roleId: roleDoc._id,
                                code: roleDoc.code,
                                name: roleDoc.title
                            }
                            rolesId.push(roleObj);
                        }
                    }));

                    if (!found) {
                        if (roleInfo) {
                            plaformRoles.push(roleInfo);
                        }
                    }
                }));

                if (plaformRoles.length == 0) {
                    plaformRoles.push("PUBLIC");
                }
                orgnisationInfo.roles = plaformRoles;

                let response = await sunBirdService.assignRoles(orgnisationInfo, token);
                if (response && response.responseCode == constants.common.RESPONSE_OK) {
                    if (response.result.response == constants.common.SUCCESS_RESPONSE) {
                        console.log(orgnisationInfo.organisationId, "rolesId", rolesId)
                        let userDetails = await database.models.userExtension.updateOne({
                            userId: orgnisationInfo.userId, "organisationRoles.organisationId": orgnisationInfo.organisationId
                        }, {
                            $set: { "organisationRoles.$.roles": rolesId }
                        });
                    }
                    resolve({ result: response.result, message: constants.apiResponses.ASSIGNED_ROLE_SUCCESSFULLY });
                } else {
                    reject({ message: response });
                }

            } catch (error) {
                return reject(error)
            }

        });
    }

    /**
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

                        let organisationInfo = [];
                        let organisationList = await sunBirdService.searchOrganisation(request, inputData.userToken);
                        if (organisationList.responseCode == constants.common.RESPONSE_OK) {
                            if (organisationList.result && organisationList.result.response &&
                                organisationList.result.response && organisationList.result.response.content) {
                                await Promise.all(organisationList.result.response.content.map(async function (orgInfo) {

                                    let address = "";
                                    if (orgInfo.address && orgInfo.address.addressLine1) {
                                        address = orgInfo.address.addressLine1
                                    }
                                    let orgDetails = {
                                        name: orgInfo.orgName,
                                        description: orgInfo.description,
                                        email: orgInfo.email,
                                        _id: orgInfo.id,
                                        noOfMembers: orgInfo.noOfMembers,
                                        externalId: orgInfo.externalId,
                                        status: orgInfo.status == 0 ? "Inactive" : "Active",
                                        provider: orgInfo.provider,
                                        // channel:orgInfo.channel
                                        address: address,
                                        // dateOfBirth:

                                    }
                                    organisationInfo.push(orgDetails);
                                }));
                            }

                            let orgColumns = _organisationColumn();
                            if (organisationInfo.length > 0) {

                                let sortedOrganisations = organisationInfo.sort(gen.utils.sortArrayOfObjects('organisationName'));

                                resolve({
                                    result: {
                                        count: organisationList.result.response.count,
                                        columns: orgColumns,
                                        data: sortedOrganisations
                                    },
                                    message: constants.apiResponses.ORG_INFO_FETCHED
                                });
                            } else {
                                resolve({
                                    result: {
                                        count: 0,
                                        columns: orgColumns,
                                        data: []
                                    }, message: constants.apiResponses.NO_ORG_FOUND
                                })
                            }

                        } else {
                            resolve({ result: organisationList, message: constants.apiResponses.NO_ORG_FOUND })
                        }
                    } else {
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



    /** 
    * to create organisation.
    * @method
    * @name  create
    * @param  {inputData}  - hold query object
    * @returns {json} Response consists of success or failure of the api.
    */
    static create(inputData, token) {
        return new Promise(async (resolve, reject) => {
            try {

                let requestBody = {
                    // "channel":inputData.organisationName,
                    "description": inputData.description,
                    "externalId": inputData.externalId,
                    // "isRootOrg": true,
                    "provider": process.env.SUNBIRD_PROVIDER,
                    "orgName": inputData.name,
                    "address": {
                        addressLine1: inputData.address,
                    },
                    // "orgType": "string",
                    // "orgTypeId": "string",
                    // "rootOrgId": "string",
                    "email": inputData.email,
                    // "license": "string",
                    // "isSSOEnabled": true,
                }
                let createOrg = await sunBirdService.createOrganisation(requestBody, token);
                if (createOrg && createOrg.responseCode == constants.common.RESPONSE_OK) {
                    resolve({ result: createOrg.result, message: constants.apiResponses.ORG_CREATED });
                } else {
                    reject({ message: createOrg });
                }

            } catch (error) {
                return reject(error)
            }
        });
    }



    /**
   * Get get organisation creation form.
   * @method
   * @name  getForm
   * @returns {json} Response consists of organisation creation form.
   */

    static getForm() {
        return new Promise(async (resolve, reject) => {
            try {

                let formData =
                    await formsHelper.list({
                        name: "organisationCreateForm"
                    }, {
                        value: 1
                    });

                if (!formData[0]) {

                    return resolve({
                        status: httpStatusCode["bad_request"].status,
                        message:
                            constants.apiResponses.ORG_FORM_NOT_FOUND
                    });

                } else {

                    resolve({ result: formData[0].value, message: constants.apiResponses.ORG_FORM_FETCHED })
                }

            } catch (error) {
                return reject(error)
            }
        });
    }

    /**
    * To update the organisational details
    * @method
    * @name  update
    * @returns {json} Response consists of organisation creation form.
    */

    static update(inputData, token) {
        return new Promise(async (resolve, reject) => {
            try {

                let requestBody = {
                    orgName: inputData.name ? inputData.name : "",
                    email: inputData.email ? inputData.email : "",
                    description: inputData.description ? inputData.description : "",
                    organisationId: inputData.organisationId,
                    address: {
                        addressLine1: inputData.address
                    }
                }

                if (inputData.externalId) {
                    requestBody['externalId'] = inputData.externalId;
                    requestBody['provider'] = process.env.SUNBIRD_PROVIDER;
                }

                let updateOrg = await sunBirdService.updateOrganisationDetails(requestBody, token);
                if (updateOrg && updateOrg.responseCode == constants.common.RESPONSE_OK) {
                    resolve({ result: updateOrg.result, message: constants.apiResponses.ORG_UPDATED });
                } else {
                    reject({ message: updateOrg });
                }

            } catch (error) {
                return reject(error)
            }
        });
    }


    /**
    * To get the organisational details
    * @method
    * @name  details
    * @returns {json} Response consists of organisation creation form.
    */

    static details(organisationId, token) {
        return new Promise(async (resolve, reject) => {
            try {

                let orgDetails = await sunBirdService.getOrganisationDetails({ organisationId: organisationId }, token);
                if (orgDetails && orgDetails.responseCode == constants.common.RESPONSE_OK) {

                    // if(orgDetails.result.response)



                    let response = orgDetails.result.response;

                    let address = "";
                    if (response.address && response.address.addressLine1) {
                        address = response.address.addressLine1
                    }

                    let responseObj = {
                        organisationId: response.organisationId,
                        status: response.status == 1 ? "Active" : "Inactive",
                        provider: response.provider,
                        name: response.orgName,
                        email: response.email,
                        externalId: response.externalId,
                        noOfMembers: response.noOfMembers,
                        description: response.description,
                        channel: response.channel,
                        updatedDate: response.updatedDate,
                        createdDate: response.createdDate,
                        address: address


                    }
                    resolve({ result: responseObj, message: constants.apiResponses.ORG_DETAILS_FOUND });
                } else {
                    reject({ message: orgDetails });
                }

            } catch (error) {
                return reject(error)
            }
        });
    }


    /**
    * To get the organisational details
    * @method
    * @name  details
    * @returns {json} Response consists of organisation creation form.
    */

    static updateStatus(inputData, token) {
        return new Promise(async (resolve, reject) => {
            try {

                let updateOrg = await sunBirdService.updateOrgStatus(inputData, token);
                if (updateOrg && updateOrg.responseCode == constants.common.RESPONSE_OK) {

                    let msg = constants.apiResponses.ORG_ACTIVATED;
                    if (inputData.status == 0) {
                        msg = constants.apiResponses.ORG_DEACTIVATED;
                    }
                    resolve({ result: updateOrg.result, message: msg });
                } else {
                    reject({ message: updateOrg });
                }

            } catch (error) {
                return reject(error)
            }
        });
    }

    /**
    * remove user from the organisation
    * @method
    * @name  removeUser
    * @returns {json} Response consists of organisation creation form.
    */

    static removeUser(inputData, token) {
        return new Promise(async (resolve, reject) => {
            try {

                let removeUser = await sunBirdService.removeUser(inputData, token);
                if (removeUser && removeUser.responseCode == constants.common.RESPONSE_OK) {

                    if (removeUser.result.response == constants.common.SUCCESS_RESPONSE) {
                        let updateUser = await database.models.userExtension.findOneAndUpdate(
                            { userId: inputData.userId }
                            , {
                                $pull: {
                                    organisations: { value: inputData.organisationId },
                                    organisationRoles: {
                                        organisationId: inputData.organisationId
                                    }
                                }

                            });


                    }
                    resolve({ result: removeUser.result, message: constants.apiResponses.USER_REMOVED });
                } else {
                    reject({ message: removeUser });
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
        'roles',
        'status',
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
            obj['type'] = "checkbox";
            obj["key"] = "id";
            // obj["visible"] = true;
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

function _getOrganisationDetailsById(orgId, token) {

    return new Promise(async (resolve, reject) => {

        // cassandraDatabase.models.organisation.findOne({ id: orgId },
        //     { raw: true }, async function (err, result) {
        //         return resolve(result);
        //     });

        let request = {
            "filters": {
                id: orgId
            }
        }

        // let organisationsList = [];
        let organisationList = await sunBirdService.searchOrganisation(request, token);
        if (organisationList.responseCode == constants.common.RESPONSE_OK) {
            if (organisationList.result && organisationList.result.response &&
                organisationList.result.response && organisationList.result.response.content) {
                // await Promise.all(organisationList.result.response.content.map(async function (orgInfo) {
                //         organisationsList.push(org);

                // }))

                resolve(organisationList.result.response.content[0]);
            }
        }

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
        'name',
        'description',
        // 'email',
        // 'noOfMembers',
        'externalId',
        'address',
        'status',
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
