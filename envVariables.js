let table = require("cli-table");

let tableData = new table();

let enviromentVariables = {
  "APPLICATION_BASE_URL": {
    "message": "Required Application base url",
    "optional": false
  },
  "AUTHORIZATION": {
    "message": "Required Server authorization code",
    "optional": false
  },
  "APPLICATION_BASE_HOST": {
    "message": "Required Base host",
    "optional": false
  },
  "MONGODB_URL": {
    "message": "Required mongodb url",
    "optional": false
  },
  "INTERNAL_ACCESS_TOKEN": {
    "message": "Required internal access token",
    "optional": false
  },
  "MIGRATION_COLLECTION": {
    "message": "Required migrations collection name",
    "optional": false
  },
  "MIGRATION_DIR": {
    "message": "Required migrations directory name",
    "optional": false
  },
  "SLACK_COMMUNICATIONS_ON_OFF": {
    "message": "Enable/Disable slack communications",
    "optional": false
  },
  "SLACK_EXCEPTION_LOG_URL": {
    "message": "Enable/Disable slack exception log url",
    "optional": false
  },
  "SLACK_TOKEN": {
    "message": "Required slack token",
    "optional": false
  },
  "USER_MANAGEMENT_HOST": {
    "message": "Required",
    "optional": false
  },
  "PLATFORM_AND_ORG_ADMIN_ROLE_TO_USER": {
    "message": "Required",
    "optional": false
  },
  "USER_MANAGEMENT_BASE_URL": {
    "message": "Required",
    "optional": false
  },
  "URL_PREFIX": {
    "message": "Required",
    "optional": false
  },
  "SAMIKSHA_SERIVCE_HOST": {
    "message": "Required",
    "optional": false
  },
  "SAMIKSHA_SERIVCE_BASE_URL": {
    "message": "Required",
    "optional": false
  },
  "KENDRA_SERIVCE_HOST": {
    "message": "Required",
    "optional": false
  },
  "KENDRA_SERIVCE_BASE_URL": {
    "message": "Required",
    "optional": false
  },
  "CLOUD_STORAGE": {
    "message": "Required",
    "optional": false
  },
  "STORAGE_BUCKET": {
    "message": "Required",
    "optional": false
  },
  "CASSANDRA_HOST": {
    "message": "Required",
    "optional": false
  },
  "CASSANDRA_PORT": {
    "message": "Required",
    "optional": false
  },
  "KEYSPACE": {
    "message": "Required",
    "optional": false
  },
  "ENABLE_CONSOLE_LOGGING" : {
    "message" : "Please specify the value for e.g. ON/OFF",
    "optional" : false
  },
  "ENABLE_FILE_LOGGING" : {
    "message" : "Please specify the value for e.g. ON/OFF",
    "optional" : false
  },
  "HEALTH_CHECK_URL" : {
    "message" : "Please specify the value for Health check url",
    "optional" : false,
    "default" : "/ping"
  },
  "LOGGER_DIRECTORY" : {
    "message" : "Please specify the value for logger directory",
    "optional" : false
  },
  "SUNBIRD_SERIVCE_HOST" : {
    "message" : "Please specify the value",
    "optional" : false
  },
  "SUNBIRD_SERIVCE_BASE_URL" : {
    "message" : "Please specify the value",
    "optional" : false
  }
}


let environmentVariablesCheckSuccessful = true;

module.exports = function() {
  Object.keys(enviromentVariables).forEach(eachEnvironmentVariable=>{
  
    let tableObj = {
      [eachEnvironmentVariable] : "PASSED"
    };
  
    let keyCheckPass = true;


    if(enviromentVariables[eachEnvironmentVariable].optional === true
      && enviromentVariables[eachEnvironmentVariable].requiredIf
      && enviromentVariables[eachEnvironmentVariable].requiredIf.key
      && enviromentVariables[eachEnvironmentVariable].requiredIf.key != ""
      && enviromentVariables[eachEnvironmentVariable].requiredIf.operator
      && validRequiredIfOperators.includes(enviromentVariables[eachEnvironmentVariable].requiredIf.operator)
      && enviromentVariables[eachEnvironmentVariable].requiredIf.value
      && enviromentVariables[eachEnvironmentVariable].requiredIf.value != "") {
        switch (enviromentVariables[eachEnvironmentVariable].requiredIf.operator) {
          case "EQUALS":
            if(process.env[enviromentVariables[eachEnvironmentVariable].requiredIf.key] === enviromentVariables[eachEnvironmentVariable].requiredIf.value) {
              enviromentVariables[eachEnvironmentVariable].optional = false;
            }
            break;
          case "NOT_EQUALS":
              if(process.env[enviromentVariables[eachEnvironmentVariable].requiredIf.key] != enviromentVariables[eachEnvironmentVariable].requiredIf.value) {
                enviromentVariables[eachEnvironmentVariable].optional = false;
              }
              break;
          default:
            break;
        }
    }
      
    if(enviromentVariables[eachEnvironmentVariable].optional === false) {
      if(!(process.env[eachEnvironmentVariable])
        || process.env[eachEnvironmentVariable] == "") {
        environmentVariablesCheckSuccessful = false;
        keyCheckPass = false;
      } else if (enviromentVariables[eachEnvironmentVariable].possibleValues
        && Array.isArray(enviromentVariables[eachEnvironmentVariable].possibleValues)
        && enviromentVariables[eachEnvironmentVariable].possibleValues.length > 0) {
        if(!enviromentVariables[eachEnvironmentVariable].possibleValues.includes(process.env[eachEnvironmentVariable])) {
          environmentVariablesCheckSuccessful = false;
          keyCheckPass = false;
          enviromentVariables[eachEnvironmentVariable].message += ` Valid values - ${enviromentVariables[eachEnvironmentVariable].possibleValues.join(", ")}`
        }
      }
    }

    if((!(process.env[eachEnvironmentVariable])
      || process.env[eachEnvironmentVariable] == "")
      && enviromentVariables[eachEnvironmentVariable].default
      && enviromentVariables[eachEnvironmentVariable].default != "") {
      process.env[eachEnvironmentVariable] = enviromentVariables[eachEnvironmentVariable].default;
    }

    if(!keyCheckPass) {
      if(enviromentVariables[eachEnvironmentVariable].message !== "") {
        tableObj[eachEnvironmentVariable] = 
        enviromentVariables[eachEnvironmentVariable].message;
      } else {
        tableObj[eachEnvironmentVariable] = `FAILED - ${eachEnvironmentVariable} is required`;
      }
    }

    tableData.push(tableObj);
  })

  console.log(tableData.toString());

  return {
    success : environmentVariablesCheckSuccessful
  }
}


