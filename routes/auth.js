const express = require('express')
const {signup, signin, signout, forgotPassword, resetPassword, socialLogin} =require('../controllers/auth')
const {userById} =require('../controllers/user')
const {userSignupValidator, passwordResetValidator, newPasswordValidator} = require('../validator')


const router = express.Router()


router.post('/signup', userSignupValidator, signup)
router.post('/signin', function(req, res){
    res.send("Hello from the 'test' URL");
});
router.get('/signout', signout)
router.put("/forgot-password", forgotPassword)
router.put("/reset-password", resetPassword)
router.post("/social-login", socialLogin)

router.param('userId', userById)



module.exports=router