module.exports = {
  async up(db) {
    global.migrationMsg = "User creation form"

    let userCreateForm =
      await db.collection('forms').findOne({ name: "userCreateForm" });

    if (!userCreateForm) {

      let allFields = [];

      let inputFields = ["organisation", "state","firstName", "lastName", "email", "phoneNumber",
        "userName","gender","password","confirmPassword","roles","dateOfBirth" ];

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
        }
      ]
      };

      await Promise.all(inputFields.map(async function (fields) {

        let inputObj = JSON.parse(JSON.stringify(inputField));
        let field = fields.replace(/([A-Z])/g, " $1");
        inputObj.label = field.charAt(0).toUpperCase() + field.slice(1);
        inputObj.field = fields;


        inputObj.validation[0].message = inputObj.label + " required";

        
        if (fields == "userName"){
          inputObj.validation.push({
            "name": "pattern",
            "validator": "^[a-zA-Z0-9]+$",
            "message": "Please provide a valid User Name"
          });
        }
        else if (fields == "password" || fields == "confirmPassword") {
          inputObj.input = "password";
         
          inputObj.validation.push({
            "name": "pattern",
            "validator": "^(?=.{8,})(?=.*[a-z])(?=.*[A-Z])(?=.*[@#$%^&+*!=]).*$",
            "message": "Minimum eight charaters required"
          });

          
        } else if (fields == "email") {
          inputObj.validation = [];
          inputObj.validation.push({
            "name": "pattern",
            "validator": "^[_A-Za-z0-9-\\+]+(\\.[_A-Za-z0-9-]+)*@[A-Za-z0-9-]+(\\.[A-Za-z0-9]+)*(\\.[A-Za-z]{2,})$",
            "message": "Please provide a valid Email"
          });

        } else if (fields == "phoneNumber") {
          inputObj.validation = [];
          inputObj.validation.push({
            "name": "pattern",
            "validator": "(0/91)?[7-9][0-9]{9}",
            "message": "Please provide a valid Phone Number"
          });
        }else if (fields == "gender") {
           inputObj.options=[
             {
              "label": "Female",
              "value": "F"
            },{
              "label": "Male",
              "value": "M"
            }]
            inputObj.validation = [];
            inputObj.input = "select";
       }else if (fields == "dateOfBirth") {
          inputObj.input = "date";
          inputObj.validation = [];

        }else if (fields === "state"){
          inputObj.input = "select";
          inputObj.validation = [];

        }else if(fields === "roles") {
              inputObj.options = [];
              inputObj.input = "multiselect";

          }else if( fields === "organisation"){
            inputObj.input = "select";
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
