module.exports = {
  async up(db) {
    global.migrationMsg = "Adding user create form"


    let userCreateForm =
      await db.collection('forms').findOne({ name: "userCreateForm" });
    if (!userCreateForm) {

      let allFields = [];
      let inputFields = ["firstName", "lastName", "email", "phoneNumber", "userName", "password","state","organisations"];
      await Promise.all(inputFields.map(async function (fields) {

        let inputObj = {};
       
        inputObj.field = fields;
        inputObj.value = "";
        inputObj.visible = true;
        inputObj.editable = true;

        if (fields == "password") {

          inputObj.label = "Password";

          inputObj.input = "password";
          inputObj['validation'] = {
            required: true,
            regex: ""
          }

        } else if (fields == "email") {
          inputObj.label = "Email";
          inputObj.input = "text";
          inputObj['validation'] = {
            required: true,
            regex: "^[_A-Za-z0-9-\\+]+(\\.[_A-Za-z0-9-]+)*@[A-Za-z0-9-]+(\\.[A-Za-z0-9]+)*(\\.[A-Za-z]{2,})$"
          }
        } else if (fields == "phoneNumber") {
          inputObj.label = "Phone Number";
          inputObj.input = "text";
          inputObj['validation'] = {
            required: true,
            regex: "^((\+)?(\d{2}[-]))?(\d{10}){1}?$"
          }
        } else if(fields =="state" || fields =="organisations" ){

         
          inputObj.label =fields.charAt(0).toUpperCase() + fields.slice(1);;
          inputObj.input = "select";
          inputObj.options = [];
          inputObj['validation'] = {
            required: true,
            regex: ""
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
          inputObj['validation'] = {
            required: true,
            regex: "/^[A-Za-z]+$/"
          }

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
