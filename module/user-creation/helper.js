/**
 * name : user-creation/helper.js
 * author : Rakesh Kumar
 * Date : 18-March-2020
 * Description : Consist of User creation and user related information.
 */

let userManagementService = 
require(ROOT_PATH +"/generics/services/user-management");

module.exports = class userCreationHelper {

    /**
   * Get user creation form.
   * @method
   * @name  getForm
   * @param  {requestedData}  - requested body.
   * @returns {json} Response consists of user creation form.
   */

    static getForm( userId,token ) {
        return new Promise(async (resolve, reject) => {
            try {

                let userProfileDocuments = 
                await database.models.forms.find({ 
                });
                
                if(userProfileDocuments){
                    let response = {
                        form:userProfileDocuments.value
                    }
                    return resolve(response);
                }else{
                    reject({ message:ConstantSourceNode.common.USER_CREATE_FORM + " not Found" });
                }
                
                

            } catch (error) {
                return reject(error);
            }
        })
    }

};