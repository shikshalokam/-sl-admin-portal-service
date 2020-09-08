module.exports = {
    name: "bulkUploadRequests",
    schema: {
      requestId:{
        type:String,
        required:true
      },
      type:{
        type: String,
        required: true
      },
      remarks:{
        type: String
      },
      userId:{
        type: String,
        required: true
      },
      inputFile:{
        type: Object
      },
      successFile:{
        type:Object
      },
      errorFile:{
        type:Object
      },
      metaInformation:{
        type:Object
      },
      status: {
        type: String,
        default: "pending"
      }
    }
  };