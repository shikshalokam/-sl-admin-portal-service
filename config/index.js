/**
 * Project          : admin-portal-services
 * Module           : Configuration
 * Source filename  : index.js
 * Description      : Environment related configuration variables
 */

/**
  * Database configuration.
  * @function
  * @name db_connect
  * @param {Object} configData  - database configuration.
*/

let db_connect = function (configData) {
  global.database = require("./db/config")(
    configData.db.connection.mongodb
  );
  global.ObjectId = database.ObjectId;
  global.Abstract = require("../generics/abstract");
};

let cassandra_connect = function (configData) {
  global.cassandraDatabase = require("./db/cassandra-config")(configData.db.connection.cassandra);
  // global.ObjectId = database.ObjectId;
  // global.Abstract = require("../generics/abstract");
};


const configuration = {
  root: require("path").normalize(__dirname + "/.."),
  app: {
    name: process.env.appName
  },
  host: process.env.HOST,
  port: process.env.PORT,
  log: process.env.LOG,
  db: {
    connection: {
      mongodb: {
        host: process.env.MONGODB_URL,
        database: process.env.DB,
        options: {
          useNewUrlParser: true
        }
      },
      cassandra: {
        host: process.env.CASSANDRA_HOST,
        port:process.env.CASSANDRA_PORT,
        keyspace: process.env.KEYSPACE,
      }
    }
  },
  version: process.env.VERSION,
  URLPrefix: process.env.URL_PREFIX,
  webUrl: process.env.WEB_URL
};
CASSANDRA_DB  = "127.0.0.1"
CASSANDRA_HOST = "9043"
KEYSPACE = "sunbird"

db_connect(configuration);
cassandra_connect(configuration);

module.exports = configuration;
