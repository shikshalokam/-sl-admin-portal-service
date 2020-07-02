
const fs = require('fs');

const https = require('https');
const request = require('request');

module.exports = {
  async up(db) {

    global.migrationMsg = "upload bulk user sample csv to cloud"
   
    let uploadfileInfo = { name: "users.csv", path: process.env.BULK_USER_SAMPLE_CSV_PATH };

    let uploadFoilderPath = "bulkUpload/";
    
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
            filePath: uploadFoilderPath+file.name,
            bucketName: bucketName,
            file: fs.createReadStream(file.path) 
  
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
