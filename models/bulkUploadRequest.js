module.exports = {
    name: "bulkUploadRequest",
    schema: {
      id: "ObjectId",
      requestType:{
        type: String,
        required: true
      },
      createdBy: {
        type: String,
        required: true
      },
      updatedBy: {
        type: String
      },
      status: {
        type: String,
        default: "proccessing"
      }
    }
  };