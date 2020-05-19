/**
 * name : kendra-service.js
 * author : Rakesh Kumar
 * Date : 18-May-2020
 * Description : All kendra service related api call.
 */

//dependencies

let urlPrefix = 
process.env.KENDRA_SERIVCE_HOST + 
process.env.KENDRA_SERIVCE_BASE_URL +
process.env.URL_PREFIX; 

const request = require('request');

/**
  * Get platform user roles
  * @function
  * @name platformUserProfile
  * @returns {Promise} returns a promise.
*/

var getPreSignedUrl = function ( token,body,endpoint ) {

    const getPresignedUrl = 
    urlPrefix + endpoint;
    
    return new Promise(async (resolve, reject) => {
        try {

            let options = {
                "headers":{
                "content-type": "application/json",
                "authorization" :  process.env.AUTHORIZATION,
                "x-authenticated-user-token" : token,
                },
                json : body
            };
            request.post(getPresignedUrl,options,callback);
            function callback(err,data){
                if( err ) {
                    return reject({
                        message : constants.apiResponses.KENDRA_SERVICE_DOWN
                    });
                } else {

                    return resolve(data.body);
                }
            }

        } catch (error) {
            return reject(error);
        }
    })

}


module.exports = {
    getPreSignedUrl : getPreSignedUrl
};