/**
 * name : Role.js
 * author : Rakesh Kumar
 * created-date : 13-April-2020
 * Description : All Role related information.
 */


/**
 * dependencies
 */



/**
    * Role
    * @class
*/

module.exports = class Role extends Abstract {

    constructor() {
        super(schemas["role"]);
    }

    /**
     * @apiDefine errorBody
     * @apiError {String} status 4XX,5XX
     * @apiError {String} message Error
     */

    /**
     * @apiDefine successBody
     *  @apiSuccess {String} status 200
     * @apiSuccess {String} result Data
     */


    static get name() {
        return "role";
    }

}

