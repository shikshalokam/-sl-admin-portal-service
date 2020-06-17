module.exports = (req) => {

    let userExtensionValidator = {

        create: function () {
            req.checkBody('firstName').exists().withMessage("required firstName");
            req.checkBody('userName').exists().withMessage("required userName");
            req.checkBody('lastName').exists().withMessage("required lastName"); 
            req.checkBody('organisation').exists().withMessage("required organisation");
            req.checkBody('roles').exists().withMessage("required roles");
            req.checkBody('password').exists().withMessage("required password");
        }
    }

    if (userExtensionValidator[req.params.method]) userExtensionValidator[req.params.method]();
};