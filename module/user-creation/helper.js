/**
 * name : user-creation/helper.js
 * author : Rakesh Kumar
 * Date : 18-March-2020
 * Description : Consist of User creation and user related information.
 */

let formsHelper = require(MODULES_BASE_PATH+"/forms/helper");

let userManagementService =
    require(ROOT_PATH + "/generics/services/user-management");

let sunBirdService =
    require(ROOT_PATH + "/generics/services/sunbird");

module.exports = class UserCreationHelper {

    /**
   * Get user creation form.
   * @method
   * @name  getForm
   * @param  {userId}  - User id.
   * @param  {token}  - authentication user token.
   * @returns {json} Response consists of user creation form.
   */

    static getForm(userId,token) {
        return new Promise(async (resolve, reject) => {
            try {

                let formData = 
                await formsHelper.list({
                    name: constants.common.USER_CREATE_FORM
                },{
                    value : 1
                });

                if( !formData[0] ) {
                    
                    return resolve({ 
                        status : httpStatusCode["bad_request"].status,
                        message: 
                        constants.apiResponses.USER_CREATE_FORM_NOT_FOUND 
                    });
                    
                }

                let stateInfo = await database.models.entities.find(
                    {
                        entityType: constants.common.STATE_ENTITY_TYPE 
                    },
                    { 
                        entityTypeId: 1, 
                        _id: 1, 
                        metaInformation: 1, 
                        groups: 1,
                        childHierarchyPath: 1 
                    }
                ).lean();
              
                let states = [];
                let stateListWithSubEntities = [];
                let stateInfoWithSub = {};
                
                await Promise.all(stateInfo.map(async function (state) {
                    
                    if ( state.groups ) {
                        
                        let found = 
                        await _checkStateWithSubEntities(
                            state.groups, 
                            state.entityTypeId
                        );

                        if (found && state.groups) {
                            stateInfoWithSub[state._id] = state.childHierarchyPath;
                        }
                    }
                    
                    states.push({
                        label: state.metaInformation.name,
                        value: state._id
                    });
                }));
                if(states){
                    states = states.sort(gen.utils.sortArrayOfObjects('label'));
                }
                

                let profileInfo = 
                await sunBirdService.getUserProfileInfo(token,userId);

                let organisations = [];

                let userProfileInfo = JSON.parse(profileInfo);
                

                let profileRoles;
                if(userProfileInfo &&  
                    userProfileInfo.result &&
                     userProfileInfo.result.response &&
                     userProfileInfo.result.response.roles
                ){
                    profileRoles = userProfileInfo.result.response.roles;
                }

                let userCustomeRole = await database.models.platformUserRolesExt.findOne({ userId: userId }, { roles: 1 });

                if (userCustomeRole && userCustomeRole.roles && userCustomeRole.roles.length > 0) {
                    userCustomeRole.roles.map(customRole => {
                        if (!profileRoles.includes(customRole.code)) {
                            profileRoles.push(customRole.code)
                        }
                    })
                }
              
                if (profileRoles.includes(constants.common.PLATFROM_ADMIN_ROLE)) {

                    let organisationsDoc = await cassandraDatabase.models.organisation.findAsync({ }, 
                        { raw: true, select: ["orgname", "id"] });
                    if (organisationsDoc) {
                        await Promise.all(organisationsDoc.map(function (orgInfo) {

                            let orgDetails = {
                                label: orgInfo.orgname,
                                value: orgInfo.id
                            }
                            organisations.push(orgDetails);
                        }));
                    }

                }
                else if( 
                    userProfileInfo && 
                    userProfileInfo.result && 
                    userProfileInfo.result.response &&
                    userProfileInfo.result.response.organisations
                ) {
                    
                    await Promise.all(
                        userProfileInfo.result.response.organisations.map(
                            async function(organisation) {

                        let organisationDetails = 
                        await cassandraDatabase.models.organisation.findOneAsync(
                            { 
                                id: organisation.organisationId 
                            }, { 
                                raw: true 
                        });

                        if( organisationDetails ) {
                            
                            organisations.push({
                                "label":organisationDetails.orgname,
                                "value":organisation.organisationId
                            });
                         }   

                    }));
                }

                if(organisations){
                    organisations = organisations.sort(gen.utils.sortArrayOfObjects('label'));
                }

                let platformRoles = 
                await database.models.platformRolesExt.find({ isHidden:false},{ 
                    code:1,
                    title:1 
                }).lean();

                let roles  = [];
                let sunBirdRoles = 
                await cassandraDatabase.models.role.findAsync(
                    { 
                        status:1
                    },{ 
                       select:["id","name"], raw: true ,allow_filtering: true
                });

                if(sunBirdRoles){
                    sunBirdRoles.map(function(sunBirdrole){
                        roles.push({
                            label : sunBirdrole.name,
                            value : sunBirdrole.id
                        })
                    });
                }
                
                if ( platformRoles.length > 0 ) {
                    
                   await Promise.all(platformRoles.map(platformRole=>{
                        roles.push({
                            label : platformRole.title,
                            value : platformRole.code
                        })
                    }));
                }  


                if(roles){
                    roles = roles.sort(gen.utils.sortArrayOfObjects("label"));
                }
                

                stateListWithSubEntities.push(stateInfoWithSub);
                
                let forms = [];
                

                formData[0].value.map(
                    async function (fields) {

                        if (fields.field == "state") {
                            fields.options = states;

                        } else if (fields.field == "organisation") {
                            fields.options = organisations;

                        } else if (fields.field == "roles") {
                            fields.options = roles;
                        }
                        forms.push(fields);
                });
                
                return resolve({
                    message : constants.apiResponses.FETCH_USER_CREATION_FORM, 
                    result: {
                        form : forms,
                        stateListWithSubEntities : stateListWithSubEntities
                    }
                });
                

            } catch (error) {
                return reject(error);
            }
        })
    }

    /**
   * create create.
   * @method
   * @name  create
   * @param  {requestedData}  - requested body.
   * @returns {json} Response consists of created user.
   */

    static create( requestedBodyData, userToken ) {
        return new Promise(async (resolve, reject) => {
            try {
                
                let userProfileCreationData =
                await userManagementService.createPlatFormUser(
                    requestedBodyData,
                    userToken
                );
                    
                return resolve(userProfileCreationData);    
            } catch (error) {
                return reject(error);
            }
        })
    }

      /**
   * update.
   * @method
   * @name  update
   * @param  {requestedData}  - requested body.
   * @returns {json} Response consists of updated user details.
   */

  static update( requestedBodyData, userToken ) {
    return new Promise(async (resolve, reject) => {
        try {
            
            let updateUser =
            await userManagementService.updatePlatFormUser(
                requestedBodyData,
                userToken
            );
                
            return resolve(updateUser);    
        } catch (error) {
            return reject(error);
        }
    })
}


};

/**
  * check state has subEntities
  * @method
  * @name _checkStateWithSubEntities
  * @param { string } stateId - Array of entities.
  * @returns {boolean}
  * */

 function _checkStateWithSubEntities(groups, entityTypeId) {
    return new Promise(async (resolve, reject) => {
        try {

         
            let entityTypeList = Object.keys(groups);
            let entityTypeDoc =
                await database.models.entityTypes.findOne({
                    _id: entityTypeId
                }, { immediateChildrenEntityType: 1 }).lean();
            if (entityTypeDoc && entityTypeDoc.immediateChildrenEntityType &&
                 entityTypeDoc.immediateChildrenEntityType.length > 0) {

                Promise.all(entityTypeList.map(async function (types) {
                    if (entityTypeDoc.immediateChildrenEntityType.includes(types)) {
                        resolve(true);
                    }
                }));
                resolve(false)
            } else {
                resolve(false);
            }
        } catch (err) {
            return reject(err);
        }
    });
}