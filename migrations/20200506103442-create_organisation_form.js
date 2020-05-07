module.exports = {
  async up(db) {
    global.migrationMsg = "Create Organisation Form Generation"
    // return await db.collection('albums').updateOne({artist: 'The Beatles'}, {$set: {blacklisted: true}});

    let userCreateForm =
    await db.collection('forms').findOne({ name: "organisationCreateForm" });

  if (!userCreateForm) {

    let allFields = [];

    let inputFields = ["name","description","email", "externalId","address"];

    let inputField = {
      "field": "",
      "value": "",
      "visible": true,
      "editable": true,
      "label": "",
      "input": "text",
      "validation": [{
        "name": "required",
        "validator": "required",
        "message": ""
      }, {
        "name": "pattern",
        "validator": "([a-zA-Z]{3,30}\s*)+",
        "message": ""
      }]
    };

    await Promise.all(inputFields.map(async function (fields) {

      let inputObj = JSON.parse(JSON.stringify(inputField));
      let field = fields.replace(/([A-Z])/g, " $1");
      inputObj.label = field.charAt(0).toUpperCase() + field.slice(1);
      inputObj.field = fields;

      let message = "";
      let validator = "";

      

      if (fields == "email") {
        validator = "^[_A-Za-z0-9-\\+]+(\\.[_A-Za-z0-9-]+)*@[A-Za-z0-9-]+(\\.[A-Za-z0-9]+)*(\\.[A-Za-z]{2,})$";
        message = "Please provide a valid Email";

      } else if(fields == "description"){
        // validator = "^[a-z0-9_-]{3,15}$";
        // message = "Please provide a valid User Name";
        inputObj.input = "textarea";
      }else if (fields == "externalId") {

        validator = "^[a-z0-9_-]{3,15}$";
        message = "Please provide a valid external id";
      }else if (fields == "address") {
        validator = "^[a-z0-9_-]{3,80}$";
        message = "Please provide a valid address";
      }else {
        validator = inputObj.validation[1].validator; 
        message = "Please Provide Valid " + inputObj.label;
      }
      
      inputObj.validation[0].message = inputObj.label + " required";
      if( fields === "description" || fields === "email"  ){
        // delete inputObj.validation[0];
        inputObj.validation = [{
          "name": "pattern",
          "validator": validator,
          "message": message
        }];
      }else{
        inputObj.validation[1].message = message;
        inputObj.validation[1].validator = validator;
      }

      allFields.push(inputObj);

    }));

    let createForm = {
      name: "organisationCreateForm",
      value: allFields
    }
    await db.collection('forms').insertOne(createForm);

  }


  },

  async down(db) {
    // return await db.collection('albums').updateOne({artist: 'The Beatles'}, {$set: {blacklisted: false}});
  }
};
