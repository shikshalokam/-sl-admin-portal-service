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

    static list(req,pageSize,pageNo) {
        return new Promise(async (resolve, reject) => {
            try {

                let userId = req.userDetails.id;
                let token = req.userDetails.userToken;

              
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

    static users(req, pageSize, pageNo) {
        return new Promise(async (resolve, reject) => {
            try {

                let response;

                let profileData = await _checkUserAdminAccess(req.userDetails.userToken, req.userDetails.id);
                if (profileData && profileData.allowed) {

                   
                    if(pageNo){
                        pageNo = pageNo -1;
                    }
                    let bodyOfRequest = {
                        "request": {
                            "filters": {
                                "organisations.organisationId": req.params._id,
                            },
                            "limit": pageSize,
                            "offset": pageNo
                        }
                    }
                    if (req.query.search) {
                        bodyOfRequest.request['query'] = req.query.search;
                    }


                    let usersList =
                        await sunBirdService.users(req.userDetails.userToken, bodyOfRequest);
                    if (usersList.responseCode == constants.common.RESPONSE_OK) {

                        let userInfo = [];
                        await Promise.all(usersList.result.response.content.map( function(userItem){
                            let resultObj = {
                                firstName:userItem.firstName,
                                lastName:userItem.lastName,
                                email:userItem.email,
                                id:userItem.id,
                                address:userItem.address,
                                createdDate:userItem.createdDate,
                                gender:userItem.gender
                            }
                            userInfo.push(resultObj);
                        }));

                        
                        response = {
                            "result": {
                                count: usersList.result.response.count,
                                usersList: userInfo
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
            if (profileData.responseCode ==  constants.common.RESPONSE_OK) {

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
