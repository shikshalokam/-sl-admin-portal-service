/**
 * name : sunbird.js
 * author : Rakesh Kumar
 * Date : 18-march-2020
 * Description : All sunbird service related information.
 */

//dependencies

const request = require('request');
const shikshalokamService = require(ROOT_PATH+"/generics/helpers/shikshalokam");

/**
  * create user
  * @function
  * @name createUser
  * @param requestBody - body data for creating user.
  * @param token - Logged in user token.
  * @returns {Promise}
*/

var organisationList = async function (token ) {

    const createUserUrl = 
    process.env.sunbird_url+constants.endpoints.SUNBIRD_ORGANISATION_LIST;

    return new Promise(async (resolve,reject)=>{
        
        let options = {
            "headers":{
            "content-type": "application/json",
            "authorization" :  process.env.AUTHORIZATION,
            "x-authenticated-user-token" : token,
            "x-channel-id" : constants.SUNBIRD_ORGANISATION_ID 
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


var getUserProfileInfo = function (token,userId) {
    const createUserUrl = 
    process.env.sunbird_url+constants.endpoints.SUNBIRD_USER_READ+"/"+userId;


    return new Promise(async (resolve,reject)=>{
        
        let options = {
            "headers":{
            "content-type": "application/json",
            "authorization" :  process.env.AUTHORIZATION,
            "x-authenticated-user-token" : token,
            "x-channel-id" : constants.SUNBIRD_ORGANISATION_ID 
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

  var users = function (token,body) {
    const userSearchAPI = 
    process.env.sunbird_url+constants.endpoints.SUNBIRD_SEARCH_USER


    return new Promise(async (resolve,reject)=>{
        
        let options = {
            "headers":{
            "content-type": "application/json",
            "authorization" :  process.env.AUTHORIZATION,
            "x-authenticated-user-token" : token,
            "x-channel-id" : constants.SUNBIRD_ORGANISATION_ID 
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
    getUserProfileInfo:getUserProfileInfo,
    users:users
};