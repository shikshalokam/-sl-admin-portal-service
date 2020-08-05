/**
 * name : Roles.js
 * author : Rakesh Kumar
 * created-date : 13-April-2020
 * Description : All Roles related information.
 */


/**
 * dependencies
 */



/**
    * Roles
    * @class
*/

module.exports = class Roles extends Abstract {

    constructor() {
        super("role");
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
        return "roles";
    }

}

