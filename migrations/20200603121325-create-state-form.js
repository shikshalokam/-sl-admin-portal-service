module.exports = {
  async up(db) {
    global.migrationMsg = "State entity creation form"

    let stateEntityCreateForm =
      await db.collection('forms').findOne({ name: "stateEntityCreateForm" });

    if (!stateEntityCreateForm) {
      let allFields = [];
      let inputFields = ["name", "externalId", "capital", "region"];

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

      inputFields.map(async function (fields) {

        let inputObj = JSON.parse(JSON.stringify(inputField));
        let field = fields.replace(/([A-Z])/g, " $1");
        inputObj.label = field.charAt(0).toUpperCase() + field.slice(1);
        inputObj.field = fields;

        let message = "";
        let validator = "";

        if (fields == "name") {
          validator = "[^a-zA-Z\s\:]*";
          message = "Please provide a valid name";
        }
        else if (fields == "externalId") {
          validator = "[^a-zA-Z0-9\s\:]*";
          message = "Please provide a valid external id";
        } else if (fields == "capital") {
          validator = "[^a-zA-Z\s\:]*";
          message = "Please provide a valid capital";
        } else if (fields == "region") {
          validator = "[^a-zA-Z\s\:]*";
          message = "Please provide a valid region";
        }

        inputObj.validation.push({
          "name": "pattern",
          "validator": validator,
          "message": message
        });
        inputObj.validation[0].message = inputObj.label + " required";
        allFields.push(inputObj);

      });

      let formData = {
        name: "stateEntityCreateForm",
        value: allFields
      }

      await db.collection('forms').insertOne(formData);
    }
  },

  async down(db) {
    // return await db.collection('albums').updateOne({artist: 'The Beatles'}, {$set: {blacklisted: false}});
  }
};
