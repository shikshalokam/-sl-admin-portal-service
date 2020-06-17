module.exports = (req) => {

    let enitiyValidator = {

        listByEntityType: function () {
            req.checkParams('_id').exists().withMessage("required entityType");
        },
        subEntityList: function () {
            req.checkParams('_id').exists().withMessage("required entityId");
        },
        details: function () {
            req.checkParams('_id').exists().withMessage("required entityId");
        },
        relatedEntities: function () {
            req.checkBody('_id').exists().withMessage("required entityId");
        },
        createStateEntity: function () {
            req.checkBody('name').exists().withMessage("required name");
            req.checkBody('externalId').exists().withMessage("required externalId");
            req.checkBody('capital').exists().withMessage("required capital");
            req.checkBody('region').exists().withMessage("required region");
            
        }
    }
    if (enitiyValidator[req.params.method]) enitiyValidator[req.params.method]();
};