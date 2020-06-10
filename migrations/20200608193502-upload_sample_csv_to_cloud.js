
const fs = require('fs');

const https = require('https');
const request = require('request');

module.exports = {
  async up(db) {


    global.migrationMsg = "upload sample csv to cloud"
   
    let files = [
      { name: "users.csv", path: process.env.BULK_USER_SAMPLE_CSV_PATH },
      { name: "entities.csv", path: process.env.BULK_ENTITIES_SAMPLE_CSV_PATH },
      { name: "entityMapping.csv", path: process.env.BULK_ENTITY_MAPPING_SAMPLE_CSV_PATH }
    ];

    let uploadFoilderPath = "bulkUpload/";
    
    let endPoint = "/cloud-services/gcp/uploadFile";
    let bucketName = process.env.STORAGE_BUCKET;

    let urlPrefix =
      process.env.KENDRA_SERIVCE_HOST +
      process.env.KENDRA_SERIVCE_BASE_URL +
      process.env.URL_PREFIX;


     await Promise.all(files.map(async function (file) {

      let apiUrl = urlPrefix + endPoint;
      let response = await apiCall(apiUrl,file);
    
    }));


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
            console.log("error", error);
            return resolve(data);
          } else {
  
            console.log("status code", data.statusCode)
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
