/**
 * name : platformRolesExt.js
 * author : Rakesh Kumar
 * created-date : 24-March-2020
 * Description : platform Roles information. 
 */

 
  /**
     * Forms
     * @class
 */
module.exports = class Forms extends Abstract {
    constructor() {
      super(schemas["platformRolesExt"]);
    }
  
    static get name() {
      return "platformRolesExt";
    }
  
  };
  