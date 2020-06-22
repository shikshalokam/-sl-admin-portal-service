/**
 * name : platform-roles.js
 * author : Rakesh Kumar
 * created-date : 24-March-2020
 * Description : Platform Roles information. 
 */


/**
   * PlatformRolesExt
   * @class
*/
module.exports = class PlatformRolesExt extends Abstract {
  constructor() {
    super(schemas["platformRolesExt"]);
  }

  static get name() {
    return "platformRolesExt";
  }

};
