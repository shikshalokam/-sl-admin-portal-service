module.exports = {
  async up(db) {
    global.migrationMsg = "Create Organisation Form Generation"

    let userCreateForm =
      await db.collection('forms').findOne({ name: "organisationCreateForm" });

    if (!userCreateForm) {

      let allFields = [];

      let inputFields = ["name", "description", "email", "externalId", "address"];

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
        }]
      };

      await Promise.all(inputFields.map(async function (fields) {

        let inputObj = JSON.parse(JSON.stringify(inputField));
        let field = fields.replace(/([A-Z])/g, " $1");
        inputObj.label = field.charAt(0).toUpperCase() + field.slice(1);
        inputObj.field = fields;

        let message = "";
        let validator = "";
        inputObj.validation[0].message = inputObj.label + " required";
        if (fields == "email") {
          validator = "^[_A-Za-z0-9-\\+]+(\\.[_A-Za-z0-9-]+)*@[A-Za-z0-9-]+(\\.[A-Za-z0-9]+)*(\\.[A-Za-z]{2,})$";
          message = "Please provide a valid Email";
          inputObj.validation.push(
            {
              "name": "pattern",
              "validator": validator,
              "message": message
            });

        } else if (fields == "description" || fields == "address") {
          inputObj.input = "textarea";
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
