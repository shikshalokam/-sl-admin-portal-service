/**
 * name : organisations.js
 * author : Rakesh kumar
 * Date : 26-Aug-2020
 * Description : All organisations related functions.
 */

 //Dependinces
 const sunbirdService =
    require(GENERIC_SERVICES_PATH + "/sunbird");
const sessionHelpers = require(GENERIC_HELPERS_PATH + "/sessions");

/**
  * To get organisations list
  * @method
  * @name getOrganisationlist
  * @param { object } userProfileInfo - user profile information
  * @param  {Object} userDocument  - user information
  * @param  {String} userToken  - user access token
  * @param {Array} roles - roles of users
  * @returns {boolean} return boolen value
  * */

 function getOrganisationlist(token, userDocument = "",roles=[]) {
    return new Promise(async (resolve, reject) => {
        try {

         
            let organisationsList = [];
            let sessionOrganisationData = sessionHelpers.get(CONSTANTS.common.ORGANISATIONS_SESSION);

            if (sessionOrganisationData && sessionOrganisationData.length > 0) {
                organisationsList = sessionOrganisationData;
            } else {

                let request = {
                    "filters": {
                    }
                }

                let organisationList = await sunbirdService.searchOrganisation(request, token);
                if (organisationList && organisationList.status && organisationList.status == HTTP_STATUS_CODE.ok.status) {
                    if (organisationList.result && organisationList.result.response &&
                        organisationList.result.response && organisationList.result.response.content) {
                        await Promise.all(organisationList.result.response.content.map(async function (orgInfo) {
                            organisationsList.push({
                                label: orgInfo.orgName,
                                value: orgInfo.id
                            });
                        }));
                        sessionHelpers.set(CONSTANTS.common.ORGANISATIONS_SESSION, organisationsList);
                    }
                }

            }
            if (!roles.includes(CONSTANTS.common.PLATFROM_ADMIN_ROLE)) {
                let userOrganisations = userDocument;
                let organisations = [];
                if (userOrganisations && userOrganisations.organisations) {
                    userOrganisations.organisations.map(organisation => {
                        organisationsList.map(orgInfo => {
                            if (orgInfo.value == organisation.value) {
                                organisations.push(orgInfo);
                            }
                        });
                    });
                }
                resolve(organisations);
            } else {
                resolve(organisationsList);
            }
        } catch (err) {
            return reject(err);
        }
    });


}
module.exports = {
    getOrganisationlist : getOrganisationlist
  };