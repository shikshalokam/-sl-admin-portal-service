/**
 * name : sunbird.js
 * author : Rakesh Kumar
 * Date : 18-march-2020
 * Description : All sunbird service related information.
 */

//dependencies

const request = require('request');

/**
  * create user
  * @function
  * @name createUser
  * @param token - Logged in user token.
  * @returns {Promise}
*/

var organisationList = async function ( token ) {

    const createUserUrl = 
    process.env.sunbird_url+constants.endpoints.SUNBIRD_ORGANISATION_LIST;

    return new Promise(async (resolve,reject)=>{
        
        let options = {
            "headers" : {
            "content-type" : "application/json",
            "authorization" :  process.env.AUTHORIZATION,
            "x-authenticated-user-token" : token
            }
        };
        
        request.get(createUserUrl,options,callback);
        
        function callback(err,data){
            if( err ) {
                return reject({
                    message : constants.apiResponses.SUNBIRD_SERVICE_DOWN
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

var getUserProfileInfo = function ( token,userId ) {
    const createUserUrl = 
    process.env.sunbird_url+constants.endpoints.SUNBIRD_USER_READ+"/"+userId;


    return new Promise(async (resolve,reject)=>{
        
        let options = {
            "headers":{
            "content-type": "application/json",
            "authorization" :  process.env.AUTHORIZATION,
            "x-authenticated-user-token" : token
            }

        };
        
        request.get(createUserUrl,options,callback);
        
        function callback(err,data){
            if( err ) {
                return reject({
                    message : constants.apiResponses.SUNBIRD_SERVICE_DOWN
                });
            } else {
                return resolve(data.body);
            }
        }
    })
}

/**
  * Get users.
  * @function
  * @name users
  * @param body - body data.
  * @param token - Logged in user token.
  * @returns {JSON} - All users data.
*/

var users = function ( token,body ) {
    const userSearchAPI = 
    process.env.sunbird_url+constants.endpoints.SUNBIRD_SEARCH_USER


    return new Promise(async (resolve,reject)=>{
        
        let options = {
            "headers":{
            "content-type": "application/json",
            "authorization" :  process.env.AUTHORIZATION,
            "x-authenticated-user-token" : token,
            },
            json : body
        };
        
        request.post(userSearchAPI,options,callback);
        
        function callback(err,data){
            if( err ) {
                return reject({
                    message : constants.apiResponses.SUNBIRD_SERVICE_DOWN
                });
            } else {
                return resolve(data.body);
            }
        }
    })
}

module.exports = {
    organisationList : organisationList,
    getUserProfileInfo : getUserProfileInfo,
    users : users
};