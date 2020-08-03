let table = require("cli-table");

let tableData = new table();

let enviromentVariables = {
  "HOST": {
    "message": "Required host name",
    "optional": false
  },
  "PORT": {
    "message": "Required port no",
    "optional": false
  },
  "LOG": {
    "message": "Required logger type",
    "optional": false
  },
  "NODE_ENV": {
    "message": "Required node environment",
    "optional": false
  },
  "ENABLE_BUNYAN_LOGGING": {
    "message": "Enable or disable bunyan logging",
    "optional": false
  },
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
  "SHIKSHALOKAM_BASE_HOST": {
    "message": "Required shikshalokam base host",
    "optional": false
  },
  "DB": {
    "message": "Required database",
    "optional": false
  },
  "INTERNAL_ACCESS_TOKEN": {
    "message": "Required internal access token",
    "optional": false
  },
  "SUNBIRD_KEYCLOAK_AUTH_SERVER_URL": {
    "message": "Required sunbird keycloak auth server url",
    "optional": false
  },
  "SUNBIRD_KEYCLOAK_REALM": {
    "message": "Required sunbird keycloak realm",
    "optional": false
  },
  "SUNBIRD_KEYCLOAK_CLIENT_ID": {
    "message": "Required sunbird keycloak client id",
    "optional": false
  },
  "SUNBIRD_KEYCLOAK_PUBLIC": {
    "message": "Required sunbird keycloak public",
    "optional": false
  },
  "SUNBIRD_CACHE_STORE": {
    "message": "Required sunbird cache store",
    "optional": false
  },
  "SUNBIRD_CACHE_TTL": {
    "message": "Required sunbird cache ttl",
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
  "RUBRIC_ERROR_MESSAGES_TO_SLACK": {
    "message": "Enable/Disable rubric error message",
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
  }
}


let success = true;

module.exports = function () {
  Object.keys(enviromentVariables).forEach(eachEnvironmentVariable => {

    let tableObj = {
      [eachEnvironmentVariable]: ""
    };

    if (!(process.env[eachEnvironmentVariable]) && !(enviromentVariables[eachEnvironmentVariable].optional)) {
      success = false;

      if (enviromentVariables[eachEnvironmentVariable] && enviromentVariables[eachEnvironmentVariable].message !== "") {
        tableObj[eachEnvironmentVariable] =
          enviromentVariables[eachEnvironmentVariable].message;
      } else {
        tableObj[eachEnvironmentVariable] = "required";
      }
    } else {

      tableObj[eachEnvironmentVariable] = "success";
      if (enviromentVariables[eachEnvironmentVariable].optional) {
        tableObj[eachEnvironmentVariable] = enviromentVariables[eachEnvironmentVariable].message;
      }

    }

    tableData.push(tableObj);
  })

  log.info(tableData.toString());

  return {
    success: success
  }
}


