module.exports = {
  async up(db) {
    global.migrationMsg = "User creation form"

    let userCreateForm =
      await db.collection('forms').findOne({ name: "userCreateForm" });

    if (!userCreateForm) {

      let allFields = [];

      let inputFields = ["organisation", "state","firstName", "lastName", "email", "phoneNumber",
        "userName","gender","password","confirmpassword","roles","dateOfBirth" ];

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

        if (fields == "password" || fields == "confirmpassword") {
          inputObj.input = "password";
       
          
          validator = "^([a-zA-Z0-9@*#]{8,15})$";
          message = "Minimum eight charaters required";
        } else if (fields == "email") {
          validator = "^[_A-Za-z0-9-\\+]+(\\.[_A-Za-z0-9-]+)*@[A-Za-z0-9-]+(\\.[A-Za-z0-9]+)*(\\.[A-Za-z]{2,})$";
          message = "Please provide a valid Email";

        } else if (fields == "phoneNumber") {
          validator = "(0/91)?[7-9][0-9]{9}";
          message = "Please provide a valid Phone Number";

        }else if(fields == "userName"){
          validator = "^[a-z0-9_-]{3,15}$";
          message = "Please provide a valid User Name";
        }else if (fields == "dateOfBirth") {
          validator = "([12]\d{3}-(0[1-9]|1[0-2])-(0[1-9]|[12]\d|3[01]))";
          message = "Please provide a valid Date of Birth";
          inputObj.input = "date";

        }else if (
          fields === "state" ||
          fields === "organisation" ||
          fields === "roles" ||
          fields === "gender"
        ) {
          inputObj.options = [];

          if (fields == "gender") {
              inputObj.options=[
                 {
                  "label": "Female",
                  "value": "F"
                },{
                  "label": "Male",
                  "value": "M"
                }]
          }
          
          if (fields == "roles") {
            inputObj.input = "multiselect";
          } else {
            inputObj.input = "select";
          }
        } else {
          validator = inputObj.validation[1].validator;
          message = "Please Provide Valid " + inputObj.label;
        }
        inputObj.validation[0].message = inputObj.label + " required";

        if( fields === "state" || fields === "gender" || fields=="dateOfBirth" ){
          delete inputObj.validation;
          inputObj.validation = [];
         
        }else if( fields === "organisation"){

          let requiredField = inputObj.validation[0]
          inputObj.validation = [];
          inputObj.validation.push(requiredField);

        
        }else{
          inputObj.validation[1].message = message;
          inputObj.validation[1].validator = validator;
        }

        allFields.push(inputObj);

      }));

      let createForm = {
        name: "userCreateForm",
        value: allFields
      }
      await db.collection('forms').insertOne(createForm);

    }
    // return await db.collection('albums').updateOne({artist: 'The Beatles'}, {$set: {blacklisted: true}});
  },

  async down(db) {
    // return await db.collection('albums').updateOne({artist: 'The Beatles'}, {$set: {blacklisted: false}});
  }
};
