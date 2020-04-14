module.exports = {
    name: "platformUserRolesExt",
    schema : {
      roles : Array,
      createdBy : String,
      updatedBy : String,
      userId : {
        type : String,
        required : true
      },
      username : {
        type : String,
        required : true
      },
      status : {
        type : String,
        default : "active"
      },
      isDeleted : {
        type : Boolean,
        default : false
      },
      metaInformation : Object,
      organisations : Array,
      organisationRoles : Array
    }
  };
  