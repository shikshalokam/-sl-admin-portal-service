/**
 * name : entity-types.js
 * author : Rakesh Kumar
 * created-date : 19-March-2020
 * Description : Entity types information. 
 */

 // Dependencies

 
  /**
     * EntityTypes
     * @class
 */
 module.exports = class EntityTypes extends Abstract {
   constructor() {
     super(schemas["entityTypes"]);
   }
 
   static get name() {
     return "entityTypes";
   }
 
 };
 