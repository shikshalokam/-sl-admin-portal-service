/**
 * name : sunbird.js
 * author : Rakesh Kumar
 * Date : 18-march-2020
 * Description : All sunbird service related information.
 */

//dependencies

const request = require('request');

/**
  * To get organisation details
  * @function
  * @name organisationList
  * @param token - Logged in user token.
  * @returns {Json} - Returns organisation list details
*/

const organisationList = async function (token) {
    return new Promise(async (resolve, reject) => {

        const createUserUrl =
            process.env.SUNBIRD_URL + CONSTANTS.endpoints.SUNBIRD_ORGANISATION_LIST;

        let options = {
            "headers": {
                "content-type": "application/json",
                "x-authenticated-user-token": token
            }
        };

        request.get(createUserUrl, options, callback);
        function callback(err, data) {
            if (err) {
                return reject({
                    message: CONSTANTS.apiResponses.SUNBIRD_SERVICE_DOWN
                });
            } else {
                return resolve(data.body);
            }
        }
    })
}

/**
  * Get the user profile information.
  * @function
  * @name getUserProfileInfo
  * @param userId - Logged in user Id.
  * @param token - Logged in user token.
  * @returns {JSON} - user profile information.
*/

const getUserProfileInfo = function (token, userId) {
    return new Promise(async (resolve, reject) => {

        const getProfileAPI = CONSTANTS.endpoints.SUNBIRD_USER_READ + "/"
            + userId + "?fields=completeness,missingFields,lastLoginTime";
        let response = await callToSunbird(token, "", getProfileAPI, "GET");

        return resolve(JSON.parse(response));


    });
}

/**
  * Get users.
  * @function
  * @name users
  * @param userInfo - user search api request.
  * @param token - Logged in user token.
  * @returns {JSON} - All users data.
*/

const users = function (token, userInfo) {
    return new Promise(async (resolve, reject) => {

        const userSearchAPI = CONSTANTS.endpoints.SUNBIRD_SEARCH_USER + "?limit=" + userInfo.limit + "&page=" + userInfo.offset;
        let response = await callToSunbird(token, userInfo, userSearchAPI);
        return resolve(response);
    })
}

/**
  * To add user to organisation.
  * @function
  * @name addUser
  * @param userInfo - user information.
  * @param token - Logged in user token.
  * @returns {JSON} - add user details
*/

const addUser = function (userInfo, token) {
    return new Promise(async (resolve, reject) => {

        const adduserToOrgUrl = CONSTANTS.endpoints.SUNBIRD_ADD_USER_TO_ORG;
        let response = await callToSunbird(token, userInfo, adduserToOrgUrl);
        return resolve(response);

    })
}

/**
  * To assign roles to user for a organisation.
  * @function
  * @name assignRoles
  * @param rolesInfo - roles info organisation.
  * @param token - Logged in user token.
  * @returns {JSON} - assign roles status
*/

const assignRoles = function (rolesInfo, token) {
    return new Promise(async (resolve, reject) => {

        const assignRolesToOrgApiUrl = CONSTANTS.endpoints.SUNBIRD_ASSIGN_ROLES_TO_ORG;

        let response = await callToSunbird(token, rolesInfo, assignRolesToOrgApiUrl);
        return resolve(response);

    })
}


/**
  * Call to sunbird api`s. 
  * @function
  * @name callToSunbird
  * @param requestBody - Logged in user Id.
  * @param token - Logged in user token.
  * @param url - url of the api call.
  * @param type - request type of the api call
  * @returns {JSON} - return response from the sunbird api.
*/

function callToSunbird(token, requestBody="", url, type = "POST") {
    return new Promise(async (resolve, reject) => {
        let options = {
            "headers": {
                "content-type": "application/json",
                "x-authenticated-user-token": token,
                "internal-access-token": process.env.INTERNAL_ACCESS_TOKEN
            }
        };
        if (type == "POST" || type == "PATCH") {
            options['json'] = requestBody;
        }

        url = process.env.SUNBIRD_SERIVCE_HOST + process.env.SUNBIRD_SERIVCE_BASE_URL + url;
     
        if(type=="GET"){
            request.get(url, options, callback);
        }else if (type == "PATCH") {
            request.patch(url, options, callback);
        } else {
            request.post(url, options, callback);
        }

        function callback(err, data) {
            if (err) {
                return reject({
                    message: CONSTANTS.apiResponses.SUNBIRD_SERVICE_DOWN
                });
            } else {
                if(data.body && data.body.status){
                    return resolve(data.body);
                }else {
                    return resolve(JSON.parse(data.body));
                }
                
            }
        }

    });
}


/**
  * To search the organisation 
  * @function
  * @name searchOrganisation
  * @param searchDetails - search details.
  * @param token - Logged in user token.
  * @returns {JSON} - organisations informations
*/

const searchOrganisation = function (searchDetails, token) {
    return new Promise(async (resolve, reject) => {
        let searchOrgUrl = CONSTANTS.endpoints.SUNBIRD_SEARCH_ORG;

        if(searchDetails.limit){
            searchOrgUrl= searchOrgUrl + "?limit="+searchDetails.limit;
        }
        if(searchDetails.offset){
            searchOrgUrl= searchOrgUrl + "&page="+searchDetails.offset;
        }
        if(searchDetails.query){
            searchOrgUrl= searchOrgUrl + "&search="+searchDetails.query;
        }
        if(searchDetails.status){
            searchOrgUrl= searchOrgUrl + "&status="+searchDetails.status
        }
        let response = await callToSunbird(token, searchDetails, searchOrgUrl);
        return resolve(response);

    });
}

/**
  * For creating organisation
  * @function
  * @name createOrganisation
  * @param organisationDetails - organisation details.
  * @param token - Logged in user token.
  * @returns {JSON} - returns created user information
*/

const createOrganisation = function (organisationDetails, token) {
    return new Promise(async (resolve, reject) => {

        const searchOrgUrl = CONSTANTS.endpoints.SUNBIRD_CREATE_ORG;
        let response = await callToSunbird(token, organisationDetails, searchOrgUrl);
        return resolve(response);

    });
}


/**
  * For updating organisation details
  * @function
  * @name updateOrganisationDetails
  * @param organisationDetails - organisation details .
  * @param token - Logged in user token.
  * @returns {JSON} - returns updated organisation details
*/
const updateOrganisationDetails = function (organisationDetails, token) {
    return new Promise(async (resolve, reject) => {

        const updateOrgDetails = CONSTANTS.endpoints.SUNBIRD_UPDATE_ORG;
        let response = await callToSunbird(token, organisationDetails, updateOrgDetails, "PATCH");
        return resolve(response);

    });
}

/**
  * To get organisational details
  * @function
  * @name getOrganisationDetails
  * @param organisationDetails - organisation details .
  * @param token - Logged in user token.
  * @returns {JSON} - returns organisation details
*/
const getOrganisationDetails = function (requestBody, token) {
    return new Promise(async (resolve, reject) => {

        const OrgDetailsAPIEndpoint = CONSTANTS.endpoints.SUNBIRD_READ_ORG + "/" + requestBody.organisationId;
        let response = await callToSunbird(token, requestBody, OrgDetailsAPIEndpoint);
        return resolve(response);


    });
}

/**
  * For remove user from the organisation
  * @function
  * @name removeUser
  * @param userDetails - organisation details .
  * @param token - Logged in user token.
  * @returns {JSON} - response consist of removed user details
*/
const removeUser = function (userDetails, token) {
    return new Promise(async (resolve, reject) => {

        const userRemoveApi = CONSTANTS.endpoints.SUNBIRD_REMOVE_USER_FROM_ORG;
        let response = await callToSunbird(token, userDetails, userRemoveApi);
        return resolve(response);

    });
}

/**
  * to Varify token is valid or not
  * @function
  * @name verifyToken
  * @param token - user token for verification 
  * @returns {JSON} - consist of token verification details
*/
const verifyToken = function (token) {
    return new Promise(async (resolve, reject) => {
        try {
            const verifyTokenEndpoint = CONSTANTS.endpoints.VERIFY_TOKEN;

            let requestBody = {
                token: token
            }
            let response = await callToSunbird(token, requestBody, verifyTokenEndpoint, "POST");
            return resolve(response);
        } catch (error) {

            reject({ message: CONSTANTS.apiResponses.SUNBIRD_SERVICE_DOWN });
        }
    })
}

/**
  * To activate organisation
  * @function
  * @name activateOrganisation
  * @param organisationId - organisation id.
  * @param token - keycloak user token.
  * @returns {JSON} - returns activated organisation status
*/
const activateOrganisation = function (organisationId, token) {
    return new Promise(async (resolve, reject) => {

        const activateOrganisationAPIEndpoint = CONSTANTS.endpoints.SUNBIRD_ORG_ACTIVATE+"/" + organisationId;
        let response = await callToSunbird(token, "", activateOrganisationAPIEndpoint, "GET");
        
        return resolve(response);
    });
}

/**
  * To deactivate organisation
  * @function
  * @name deactivateOrganisation
  * @param organisationId - organisation id.
  * @param token - keycloak user token.
  * @returns {JSON} - returns deactivate organisation status
*/
const deactivateOrganisation = function (organisationId, token) {
    return new Promise(async (resolve, reject) => {

        const deactivateOrganisationAPIEndpoint = CONSTANTS.endpoints.SUNBIRD_ORG_DEACTIVATE+"/" + organisationId;
        let response = await callToSunbird(token, "", deactivateOrganisationAPIEndpoint, "GET");
        return resolve(response);
    });
}

module.exports = {
    organisationList: organisationList,
    getUserProfileInfo: getUserProfileInfo,
    users: users,
    addUser: addUser,
    assignRoles: assignRoles,
    searchOrganisation: searchOrganisation,
    createOrganisation: createOrganisation,
    updateOrganisationDetails: updateOrganisationDetails,
    getOrganisationDetails: getOrganisationDetails,
    removeUser: removeUser,
    verifyToken: verifyToken,
    activateOrganisation: activateOrganisation,
    deactivateOrganisation: deactivateOrganisation

};