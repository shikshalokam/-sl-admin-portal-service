/**
 * name : cassandra.js.
 * author : Aman Karki.
 * created-date : 20-July-2020.
 * Description : cassandra configurations.
 */

const ExpressCassandra = require('express-cassandra');

/**
 * Cassandra DB setup.
 * @method
 * @name DB
 * @param  {Object} config - cassandra configurations information.
*/

const DB = function (config) {
    var models = ExpressCassandra.createClient({
        clientOptions: {
            contactPoints: [config.host],
            protocolOptions: { port: config.port },
            keyspace: config.keyspace,
            queryOptions: { consistency: ExpressCassandra.consistencies.one }
        },
        ormOptions: {
            defaultReplicationStrategy: {
                class: 'SimpleStrategy',
                replication_factor: 1
            },
            migration: 'safe',
        }
    });

    var createModel = function (opts) {
        var MyModel = models.loadSchema(opts.name, opts.schema);
        MyModel.syncDB(function (err, result) {
            if (err) throw err;
            LOGGER.info("Connected to cassandra database!");
        });
        return models.instance;
    }
    return {
        models: models.instance,
        createModel: createModel,
    };
};

module.exports = DB;
