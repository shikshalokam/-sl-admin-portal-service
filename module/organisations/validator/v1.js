module.exports = (req) => {

    let organisationValidator = {

        addUser: function () {
            req.checkBody('userId').exists().withMessage("required userId");
            req.checkBody('roles').exists().withMessage("required roles");
            req.checkBody('lastName').exists().withMessage("required lastName"); 
        },
        assignRoles: function () {
            req.checkBody('organisationId').exists().withMessage("required organisationId");
            req.checkBody('userId').exists().withMessage("required userId");
            req.checkBody('roles').exists().withMessage("required roles"); 
        },
        create: function () {
            req.checkBody('description').exists().withMessage("required description");
            req.checkBody('externalId').exists().withMessage("required externalId");
            req.checkBody('name').exists().withMessage("required name"); 
            req.checkBody('address').exists().withMessage("required address");
        },
        update: function () {
            req.checkBody('organisationId').exists().withMessage("required organisationId");
        },
        updateStatus: function () {
            req.checkBody('organisationId').exists().withMessage("required organisationId");
            req.checkBody('status').exists().withMessage("required status");
        },
        details: function () {
            req.checkParams('_id').exists().withMessage("required organisationId");
        },
        removeUser: function () {
            req.checkBody('userId').exists().withMessage("required userId");
            req.checkBody('organisationId').exists().withMessage("required organisationId");
        }
    }
    if (organisationValidator[req.params.method]) organisationValidator[req.params.method]();
};