let fs = require("fs"),
  path = require("path"),
  requireAll = require("require-all");

mkdirp(path.join(__dirname + "/../logs/" + process.env.NODE_ENV));
mkdirp(path.join(__dirname + "/../" + "uploads"));
gen = Object.assign(global, {});

module.exports = function () {
  var Log = require("log");
  global.log = new Log(global.config.log);
  
  global.async = require("async");
  global.ROOT_PATH = path.join(__dirname, '..')
  global.GENERIC_HELPERS_PATH = ROOT_PATH + "/generics/helpers"
  global.MODULES_BASE_PATH = ROOT_PATH + "/module"
  global._ = require("lodash");
  gen.utils = require(ROOT_PATH + "/generics/helpers/utils");
  global.config = require(".");

  global.httpStatusCode = 
  require(ROOT_PATH + "/generics/http-status-codes");

  global.ENABLE_DEBUG_LOGGING = process.env.ENABLE_DEBUG_LOGGING || "ON";
  global.ENABLE_BUNYAN_LOGGING = process.env.ENABLE_BUNYAN_LOGGING || "ON";

  // global.REQUEST_TIMEOUT_FOR_REPORTS = process.env.REQUEST_TIMEOUT_FOR_REPORTS;

  // boostrap all models
  global.models = requireAll({
    dirname: ROOT_PATH + "/models",
    filter: /(.+)\.js$/,
    resolve: function (Model) {
      return Model;
    }
  });


   // load schema files
   global.schemas = new Array
   fs.readdirSync(ROOT_PATH + '/models/').forEach(function (file) {
     if (file.match(/\.js$/) !== null) {
       var name = file.replace('.js', '');
       global.schemas[name] = require(ROOT_PATH + '/models/' + file);
     }
   });

  // boostrap all controllers
  global.controllers = requireAll({
    dirname: ROOT_PATH + "/controllers",
    filter: /(.+)\.js$/,
    resolve: function (Controller) {
      return new Controller();
    }
  });

// Load all message constants
  global.constants = new Array
  fs.readdirSync(ROOT_PATH + "/generics/constants")
  .forEach(function (file) {
    if (file.match(/\.js$/) !== null) {
      let name = file.replace('.js', '');
      name = gen.utils.hyphenCaseToCamelCase(name);
      global.constants[name] = 
      require(ROOT_PATH + "/generics/constants/" + file);
    }
  });


};

function mkdirp(dir, exist = "", state = 1) {
  if (dir != exist) {
    let path = dir.split("/");
    exist = exist + "/" + path[state];
    path = path.slice(state + 1, path.length);
    if (fs.existsSync(exist)) {
      mkdirp(dir, exist, ++state);
    } else {
      fs.mkdirSync(exist);
      mkdirp(dir, exist, ++state);
    }
  }
}
