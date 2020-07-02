module.exports = (req) => {

    let usersValidator = {

        create: function () {
            req.checkBody('firstName').isAlpha().withMessage("invalid firstName");
            req.checkBody('userName').exists().withMessage("required userName");
            req.checkBody('lastName').isAlpha().withMessage("invalid lastName"); 
            req.checkBody('organisation').exists().withMessage("required organisation");
            req.checkBody('roles').exists().withMessage("required roles");
            req.checkBody('password').exists().withMessage("required password");
        }
    }

    if (usersValidator[req.params.method]) usersValidator[req.params.method]();
};