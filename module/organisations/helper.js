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

    static list(req) {
        return new Promise(async (resolve, reject) => {
            try {

                let userId = req.userDetails.id;
                let token = req.userDetails.userToken;

                let pageNo = req.query.pageNo ? req.query.pageNo : 1;
                let pageSize = req.query.pageSize ? req.query.pageSize : 50;

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
                        return reject({ message: constants.apiResponses.NO_ORG_FOUND });
                    }
                } else {
                    return reject({ message: constants.apiResponses.INVALID_ACCESS });
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

    static users(req) {
        return new Promise(async (resolve, reject) => {
            try {

                let profileData = await _checkUserAdminAccess(req.userDetails.userToken, req.userDetails.id);
                if (profileData && profileData.allowed) {
                    let bodyOfRequest = {
                        "request": {
                            "filters": {
                                "organisations.organisationId": req.params._id
                            },
                            "limit": req.query.pageSize ? parseInt(req.query.pageSize) : 10,
                            "offset": req.query.pageNo ? parseInt(req.query.pageSize) : 1
                        }
                    }
                    let usersList =
                        await sunBirdService.users(req.userDetails.userToken, bodyOfRequest);
                    if (usersList.responseCode == "OK") {

                        let responseObj = {
                            count: usersList.result.response.count,
                            usersList: usersList.result.response.content
                        }
                        return resolve({ result: responseObj, message: constants.apiResponses.USERS_LIST_FETCHED });
                    } else {
                        return resolve({ message: constants.apiResponses.USER_LIST_NOT_FOUND });
                    }

                } else {
                    return reject({ message: constants.apiResponses.INVALID_ACCESS });
                }

            } catch (error) {
                return reject(error);
            }
        })
    }

};

function _checkUserAdminAccess(token, userId) {

    return new Promise(async (resolve, reject) => {
        try {
            let profileInfo =
                await sunBirdService.getUserProfileInfo(token, userId);

            let profileData = JSON.parse(profileInfo);
            if (profileData.responseCode == "OK") {

                if (profileData.result && profileData.result.response
                    && profileData.result.response.roles) {

                    profileData['allowed'] = false;
                    await Promise.all(profileData.result.response.roles.map(async function (role) {
                        if (constants.common.ORG_ADMIN_ALLOWED_ROLES.includes(role)) {
                            profileData['allowed'] = true;
                            return resolve(profileData);
                        }
                    }));

                    return resolve(profileData);
                } else {
                    return reject({ message: constants.apiResponses.INVALID_ACCESS });
                }

            } else {
                return reject({ message: constants.apiResponses.USER_INFO_NOT_FOUND });
            }

        } catch (error) {
            return reject(error);
        }
    })
}
