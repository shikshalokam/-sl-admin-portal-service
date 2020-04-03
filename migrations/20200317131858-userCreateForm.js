module.exports = {
  async up(db) {
    global.migrationMsg = "User create form"
    let userCreateForm =
      await db.collection('forms').findOne({ name: "userCreateForm" });
    if (!userCreateForm) {

      let allFields = [];
      let inputFields = ["firstName", "lastName", "email", "phoneNumber", 
      "userName", "password","state","organisations","roles"];
      await Promise.all(inputFields.map(async function (fields) {

        let inputObj = {};
       
        inputObj.field = fields;
        inputObj.value = "";
        inputObj.visible = true;
        inputObj.editable = true;
        inputObj.validation = [];


        let message = "";
        let validator = "";
        if (fields == "password") {

          inputObj.label = "Password";
          inputObj.input = "password";

          validator = "^(?=.*\d).{4,8}$";
          message = "Minimum four charaters required";
 
         
        } else if (fields == "email") {
          inputObj.label = "Email";
          inputObj.input = "text";
          validator = "^[_A-Za-z0-9-\\+]+(\\.[_A-Za-z0-9-]+)*@[A-Za-z0-9-]+(\\.[A-Za-z0-9]+)*(\\.[A-Za-z]{2,})$";
          message = "Please provide a valid Email";


        } else if (fields == "phoneNumber") {
          inputObj.label = "Phone Number";
          inputObj.input = "text";
          validator = "(0/91)?[7-9][0-9]{9}";
          message = "Please provide a valid Phone Number";

        } else if(fields =="state" || fields =="organisations" || fields =="roles" ){


          inputObj.label =fields.charAt(0).toUpperCase() + fields.slice(1);
          inputObj.input = "select";
          inputObj.options = [];
          validator = "";
          message = "";
          if( fields =="organisations"){
            inputObj.visible = false;
          }

        }else{
         
          if(fields == "firstName"){
            inputObj.label = "First name";

          }else if(fields == "lastName"){
            inputObj.label = "Last name";

          }else if(fields == "userName"){
            inputObj.label = "User Name";
          }
          inputObj.input = "text";
          validator = "([a-zA-Z]{3,30}\s*)+";
          message = "Please provide a valid "+inputObj.label;

        }

        inputObj.validation.push({
          name: "required",
          validator: "required",
          message: inputObj.label+" required"
        });

        let patternValidation = {
          name: "pattern",
          validator: validator,
          message:message
        }
        inputObj.validation.push(patternValidation);
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
