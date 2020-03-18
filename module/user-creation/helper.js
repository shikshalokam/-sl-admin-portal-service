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

    static getForm() {
        return new Promise(async (resolve, reject) => {
            try {

                let userProfileDocuments = 
                await database.models.forms.findOne({ name: constants.common.USER_CREATE_FORM
                });

                if(userProfileDocuments){
                    let response = {
                        form:userProfileDocuments.value
                    }
                    return resolve({ result:response });
                }else{
                    // apiResponses
                    reject({ message:constants.apiResponses.USER_CREATE_FORM_NOT_FOUND });
                }
                
                

            } catch (error) {
                return reject(error);
            }
        })
    }

    /**
   * create create.
   * @method
   * @name  create
   * @param  {requestedData}  - requested body.
   * @returns {json} Response consists of created user.
   */

  static create(req) {
    return new Promise(async (resolve, reject) => {
        try {

            try {

                let userProfileCreationData = 
                await userManagementService.create(
                    req.body
                )

                return resolve(userProfileCreationData);

            } catch (error) {
                return reject(error);
            }
            
            

        } catch (error) {
            return reject(error);
        }
    })
}


};