/**
 * name : user-extensions.js
 * author : Rakesh Kumar
 * Date : 20-Apr-2020
 * Description : Schema for user extension collection.
 */

module.exports = {
    name: "userExtension",
    schema: {
      externalId: {
        type: String,
        required: true
      },
      userId: {
        type: String,
        required: true
      },
      roles: Array,
      createdBy: {
        type: String,
        required: true
      },
      updatedBy: {
        type: String,
        required: true
      },
      status: {
        type: String,
        default: "active"
      },
      isDeleted: {
        type: Boolean,
        default: false
      },
      devices : Array,
      metaInformation : Object,
      organisations : Array,
      organisationRoles : Array
     
    }
  }