/**
 * name : helper.js
 * author : Rakesh Kumar
 * Date : 06-04-2020
 * Description : All forms related helper functionality.
 */


module.exports = class FormsHelper {
      
    /**
     * Form list.
     * @method
     * @name list
     * @name list
     * @param {Object} [queryParameter = "all"] - Filtered query data.
     * @param {Array} [projection = {}] - Projected data.   
     * @param {Object} [skipFields = "none" ]
     * @returns {Object} returns a form data.
    */

   static list(queryParameter = "all", fieldsArray = {},skipFields = "none") {
       
    return new Promise(async (resolve, reject) => {
        
        try {
            
            if (queryParameter === "all") {
                queryParameter = {};
            };

            let projection = {}

            if (fieldsArray != "all") {
                fieldsArray.forEach(field => {
                    projection[field] = 1;
                });
            }

            if (skipFields != "none") {
                skipFields.forEach(element => {
                    projection[element] = 0;
                });
            }

            const formData = 
            await database.models.forms.find(queryParameter, projection).lean();

            return resolve(formData);

        } catch (error) {
            return reject(error);
        }
    })
}

};