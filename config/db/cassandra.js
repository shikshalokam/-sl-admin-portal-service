var ExpressCassandra = require('express-cassandra');

var DB = function (config) {
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
            log.debug("Connected to Cassandra DB");
        });
        return models.instance;
    }
    return {
        models: models.instance,
        createModel: createModel,
    };
};
module.exports = DB;