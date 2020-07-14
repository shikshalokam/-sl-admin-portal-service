
const fs = require('fs');
const https = require('https');
const request = require('request');
var path = require('path');
const appPath = path.join(__dirname, '..');

module.exports = {
  async up(db) {

    global.migrationMsg = "Upload bulk entity mapping sample csv to cloud"
   
    let uploadfileInfo = { name: "entityMapping.csv",  path: "/public/bulkUploadSamples/entityMapping .csv" };

    let uploadFolderPath = "bulkUploadSamples/";
    
    let endPoint = "";

    if(process.env.CLOUD_STORAGE == "AWS"){
      endPoint = "/cloud-services/aws/uploadFile";
    }else if(process.env.CLOUD_STORAGE == "GC"){
      endPoint = "/cloud-services/gcp/uploadFile";
    }else if(process.env.CLOUD_STORAGE == "AZURE"){
      endPoint = "/cloud-services/azure/uploadFile";
    }

    let bucketName = process.env.STORAGE_BUCKET;

    let kendraBaseUrl =
      process.env.KENDRA_SERIVCE_HOST +
      process.env.KENDRA_SERIVCE_BASE_URL +
      process.env.URL_PREFIX;

    let response = await apiCall(kendraBaseUrl+endPoint,uploadfileInfo);

    function apiCall(apiUrl,file) {
      return new Promise(async function (resolve, reject) {


        let options = {
          "headers": {
            'Content-Type': "application/json",
            "internal-access-token": process.env.INTERNAL_ACCESS_TOKEN
          },
          formData: {
            filePath: uploadFolderPath+file.name,
            bucketName: bucketName,
            file: fs.createReadStream(appPath+file.path) 
  
          }
        };
  
        request.post(apiUrl, options, callback);
        function callback(err, data) {
          if (err) {
            return resolve(data);
          } else {
             return resolve(data.body);
          }
        }
       
      })
    }
  },

  async down(db) {
    // return await db.collection('albums').updateOne({artist: 'The Beatles'}, {$set: {blacklisted: false}});
  }
};
