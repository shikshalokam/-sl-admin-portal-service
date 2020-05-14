/**
 * name : bulk-upload-request/helper.js
 * author : Rakesh Kumar
 * Date : 18-March-2020
 * Description : Consist of User creation and user related information.
 */

const csv = require('csvtojson');

module.exports = class UserCreationHelper {



   /**
    * to get bulkUserUpload.
    * @method
    * @name  bulkUserUpload
    * @returns {json} Response consists sample csv data
    */

   static bulkUserUpload(req,userId) {
    return new Promise(async (resolve, reject) => {
        try {

            let configData = await csv().fromString(req.files.userCreationFile.data.toString());
            let doc = {
                requestType:"user-create",
                createdBy:userId
              }
         
            let request =  await database.models.bulkUploadRequest.create(doc); 
            resolve({ result:{ requestId:request._id } ,message:constants.apiResponses.REQUEST_SUBMITTED });
        } catch (error) {
            return reject(error);
        }
    })
 }

    /**
    * to get request List.
    * @method
    * @name  list
    * @returns {json} Response consists sample csv data
    */

   static list(userId,searchText,pageSize,pageNo) {
    return new Promise(async (resolve, reject) => {
        try {

            let skip = pageSize * (pageNo - 1);

            let columns = _bulkRequestList();
            let count = await database.models.bulkUploadRequest.count({});

            let request =  await database.models.bulkUploadRequest.find({ },{ }, { skip: skip, limit: pageSize }); 
            resolve({ result: { data: request,count:count,column:columns } });
        } catch (error) {
            return reject(error);
        }
    })
 }

     /**
    * to get request details.
    * @method
    * @name  list
    * @returns {json} Response consists sample csv data
    */

   static details(requestId) {
    return new Promise(async (resolve, reject) => {
        try {

            let requestDoc =  await database.models.bulkUploadRequest.findOne({ _id:requestId });
            if(requestDoc){
                resolve({ result:{ data:{ requestDoc } } });
            }else{
                reject({ status: httpStatusCode["bad_request"].status,message:httpStatusCode["bad_request"].message });
            }
            
        } catch (error) {
            return reject(error);
        }
    })
 }


 

}


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

function _bulkRequestList() {

    let columns = [
        'select',
        'requestType',
        'status',
        'createdAt',
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
