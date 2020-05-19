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
  global.cassandraDatabase = require("./db/cassandra")(configData.db.connection.cassandra);
  if(!global.Abstract){
    global.Abstract = require("../generics/abstract");
  }
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

db_connect(configuration);
cassandra_connect(configuration);

module.exports = configuration;
