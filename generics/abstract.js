/**
 * name : abstract.js
 * author : Aman Karki.
 * Date : 20-July-2020
 * Description : Abstract class.
 */

 /**
    * Abstract
    * @class
*/

let Abstract = class Abstract {
  
  constructor(schema) {
    if (schema && schemas[schema] && schemas[schema].db_type && schemas[schema].db_type =="cassandra") {
      cassandraDatabase.createModel(schemas[schema]);
    } else if(schema && schemas[schema]) {
      database.createModel(schemas[schema]);
    }
  }
};

module.exports = Abstract;
