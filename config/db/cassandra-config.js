var models = require('express-cassandra');

//Tell express-cassandra to use the models-directory, and
//use bind() to load the models using cassandra configurations.

let fs = require("fs");
let path = require("path");

let DB = function(config){
let cassandraPath = path.join(__dirname, '../../cassandra_models')

models.setDirectory(cassandraPath).bind(
    {
        clientOptions: {
            contactPoints: [config.host],
            protocolOptions: { port: config.port },
            keyspace: config.keyspace,
            queryOptions: {consistency: models.consistencies.one}
        },
        ormOptions: {
            defaultReplicationStrategy : {
                class: 'SimpleStrategy',
                replication_factor: 1
            },
            migration: 'safe'
            
        }
    },
    function(err) {
        if(err) {
            console.log("err",err);
            throw err; 
        }else{
            log.debug("Connected to Cassandra DB");
        }
        
        // You'll now have a `person` table in cassandra created against the model
        // schema you've defined earlier and you can now access the model instance
        // in `models.instance.Person` object containing supported orm operations.
    }
);

return {
    // database: db,
    models: models.instance,
    // ObjectId: ObjectId,
    // models: db.models
  };
};

module.exports = DB;
