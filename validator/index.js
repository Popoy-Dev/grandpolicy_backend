const Joi = require('joi')
const { flatten } = require('lodash')

const createPostSchema = Joi.object({
    body: Joi.string().min(4).max(2000).required()
})

const createNewsSchema = Joi.object({
    body: Joi.string().min(4).max(2000).required()
})

exports.createPostValidator = (data) => {
    const { error, value } = createPostSchema.validate({ body: data.body })
    if (error) {
        return { error: error }
    }
    return { error: null }
}
exports.createNewValidator = (data) => {
    const { error, value } = createNewsSchema.validate({ body: data.body })
    if (error) {
        return { error: error }
    }
    return { error: null }
}

exports.userSignupValidator = (req, res, next) => {
    req.check('username', 'username is required').notEmpty()
    req.check('email', 'Email must be between 3 to 32 characters')
        .matches(/.+\@.+\..+/)
        .withMessage('email must contain @')
        .isLength({
            min: 4,
            max: 200
        })
    req.check('password', 'password is required').notEmpty()
    req.check('password')
        .isLength({ min: 6 })
        .withMessage('password must contain at least 6 characters')
        .matches(/\d/)
        .withMessage('password must contain a number')

    const errors = req.validationErrors()
    if (errors) {
        const firstError = errors.map((error) => error.msg)
        return res.status(400).json({ error: firstError })
    }
    next()
}

//  exports.userSignupValidator = (req, res, next) => {
//      const schema = Joi.object({
//          username: Joi.string().alphanum().min(3).max(200).trim(true).required(),
//          email: Joi.string().email().trim(true).lowercase().required(),
//          password: Joi.string().min(6).max(16).required()
//      }).required()


//      const {result} = schema.validate(req.body)
//      console.log(result)
//      next()
//  }

exports.passwordResetValidator = (req, res, next) => {
    req.check("newPassword", "Password is required").notEmpty()
    req.check("newPassword")
        .isLength({ min: 6 })
        .withMessage("Password must be at least 6 characters long")
        .matches(/^([a-zA-Z0-9_\-\.]+)@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.)|(([a-zA-Z0-9\-]+\.)+))([a-zA-Z]{2,4}|[0-9]{1,3})(\]?)$/)
        .withMessage("Must contain a number")
        .withMessage("Password must contain a number")

    const errors = req.validationErrors()

    if (errors) {
        const firstError = errors.map(error => error.msg)[0]
        return res.status(400).json({ error: firstError })
    }
    next()

}

const passwordResetSchema = Joi.object({
    body: Joi.string()
        .pattern(new RegExp('^[a-zA-Z0-9]{3,30}$')).required()
})


exports.newPasswordValidator = (req, res, next) => {
    const { error } = passwordResetSchema.validate({ body: req.body.resetInfo.newPassword })
    if (error) {
        return res.status(400).json({ error: error }
        )
    }
    next()
}




