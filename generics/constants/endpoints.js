/**
 * name : constants/endpoints.js
 * author : Rakesh Kumar
 * Date : 17-March-2020
 * Description : All service endpoints
 */

module.exports = {

    PLATFORM_USER_PROFILE: "/userExtension/getProfile",
    PLATFORM_USER_CREATE: "/userExtension/create",
    PLATFORM_USER_UPDATE: "/platformUserRoles/update",
    STATUS_UPDATE: "/userExtension/statusUpdate",
    USER_DETAILS: "/userExtension/userDetails",
    INACTIVATE_USER: "/userExtension/inactivate",
    ACTIVATE_USER: "/userExtension/activate",
    SUNBIRD_ADD_USER_TO_ORG: "api/v1/users/addUserToOrganisation",
    SUNBIRD_ASSIGN_ROLES_TO_ORG: "api/v1/organisations/assignRoles",
    SUNBIRD_ORGANISATION_LIST: "api/v1/organisations/list",
    SUNBIRD_USER_READ: "api/v1/users/getProfile",
    SUNBIRD_SEARCH_USER: "api/v1/organisations/users",
    SUNBIRD_SEARCH_ORG: "api/v1/organisations/list",
    SUNBIRD_CREATE_ORG: "api/v1/organisations/create",
    SUNBIRD_UPDATE_ORG: "api/v1/organisations/update",
    SUNBIRD_READ_ORG: "api/v1/organisations/details",
    SUNBIRD_ORG_STATUS_UPDATE: "api/v1/organisations/updateStatus",
    SUNBIRD_REMOVE_USER_FROM_ORG: "api/v1/organisations/removeUser",
    GCP_PRESIGNED_URL: "/cloud-services/gcp/preSignedUrls",
    AWS_PRESIGNED_URL: "/cloud-services/aws/preSignedUrls",
    AZURE_PRESIGNED_URL: "/cloud-services/azure/preSignedUrls",
    UPLOAD_TO_GCP: "/cloud-services/gcp/uploadFile",
    UPLOAD_TO_AWS: "/cloud-services/aws/uploadFile",
    UPLOAD_TO_AZURE: "/cloud-services/azure/uploadFile",
    DOWNLOAD_GCP_URL: "/cloud-services/gcp/getDownloadableUrl",
    DOWNLOAD_AWS_URL: "/cloud-services/aws/getDownloadableUrl",
    DOWNLOAD_AZURE_URL: "/cloud-services/azure/getDownloadableUrl",
    BULK_ENTITY: "/entities/bulkCreate?type=",
    BULK_ENTITY_MAPPING: "/entities/mappingUpload",
    VERIFY_TOKEN: "api/v1/token/verify",
    SUNBIRD_ORG_ACTIVATE: "api/v1/organisations/activate",
    SUNBIRD_ORG_DEACTIVATE: "api/v1/organisations/deactivate",
    SUNBIRD_PLATFORM_ROLES: "api/v1/roles/list",
}