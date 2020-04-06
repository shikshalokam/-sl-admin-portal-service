module.exports = {
  async up(db) {
    global.migrationMsg = "User creation form"
    
    let userCreateForm =
    await db.collection('forms').findOne({ name: "userCreateForm" });

    if (!userCreateForm) {

      let allFields = [];
      
      let inputFields = ["firstName", "lastName", "email", "phoneNumber", 
      "userName", "password","state","organisations","roles"];

      let inputField = {
        "field" : "",
        "value" : "",
        "visible" : true,
        "editable" : true,
        "label" : "",
        "input" : "text",
        "validation" : [{
          "name" : "required",
					"validator" : "required",
					"message" : ""
        },{
					"name" : "pattern",
					"validator" : "^[A-Za-z]+$/",
					"message" : ""
        }]
      };

      await Promise.all(inputFields.map(async function (fields) {

        let inputObj = JSON.parse(JSON.stringify(inputField));
        let field = fields.replace( /([A-Z])/g, " $1" );
        inputObj.label = field.charAt(0).toUpperCase() + field.slice(1);
        inputObj.field = fields;

        let message = "";
        let validator = "";

        if ( fields == "password" ) {
          inputObj.input = fields;
          validator = "^(?=.*\d).{4,8}$";
          message = "Minimum four charaters required";
        } else if (fields == "email") {
          validator = "^[_A-Za-z0-9-\\+]+(\\.[_A-Za-z0-9-]+)*@[A-Za-z0-9-]+(\\.[A-Za-z0-9]+)*(\\.[A-Za-z]{2,})$";
          message = "Please provide a valid Email";

        } else if (fields == "phoneNumber") {
          validator = "(0/91)?[7-9][0-9]{9}";
          message = "Please provide a valid Phone Number";

        } else if(
          fields === "state" || 
          fields === "organisations" ||
          fields === "roles" 
          ) {

            inputObj.input = "select";
            inputObj.options = [];
            
          
        } else {
          validator = inputObj.validation[1].validator;
          message = "Please Provide Valid "+inputObj.label;
        }

        inputObj.validation[0].message = inputObj.label+" required";
        inputObj.validation[1].message = message;
        inputObj.validation[1].validator = validator;
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
