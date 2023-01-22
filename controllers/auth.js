const jwt = require('jsonwebtoken')
require('dotenv').config()
const { expressjwt } = require("express-jwt")
const User = require('../models/user')
const _ = require("lodash")
const {sendEmail}= require("../helpers")


exports.signup = async(req, res)=>{
    const emailExists = await User.findOne({email: req.body.email})
    
    if(emailExists) return res.status(403).json({
        error: "email is taken"
    }) 
    const userNameExists = await User.findOne({username: req.body.username})
    if(userNameExists) return res.status(403).json({
        error: "username is taken"
    })
    const user = await new User(req.body)
    console.log(user)
    await user.save()
    res.status(200).json({message : "signup success"})
    console.log("dfsdfsefef")
}

exports.signin = (req, res)=>{
    const { email, password }= req.body
    User.findOne({email}, (err, user)=>{
        if(err || !user){
            return res.status(401).json({
                error: "user with that email does not exist. "
            })
        }

        if(!user.authenticate(password)){
            return res.status(401).json({
                error: "email and password do not match"
            })
        }

        const token = jwt.sign({_id: user._id}, process.env.JWT_SECRET)
        res.cookie('t', token, {expire: new Date()+9999})
        const { _id, username, email }= user
        return res.json({token, user: {_id, email, username}})
       
    })
}

exports.signout = (req, res) =>{
    res.clearCookie('t')
    return res.json({message: "signout success"})
}

exports.requireSignin = expressjwt({
    secret: process.env.JWT_SECRET,
    algorithms: ['HS256'],
    userProperty: 'auth'
})

exports.forgotPassword = (req, res)=> {
    if(!req.body) 
    {return res.status(400).json({message: "No request body"})}
    if(!req.body.email){
        return res.status(400).json({message: "No email in request body"})
    }
    console.log("Forgot password finding user with that email")
    const{email} = req.body
    console.log("signin req.body", email)
    User.findOne({email }, (err, user)=>{
        if(err||!user) return res.status(401).json({
                error: "User with that email does not exists"
            })
            const token= jwt.sign({
                _id : user._id, iss:"NODEAPI"
            }, process.env.JWT_SECRET)

            const emailData = {
                from: "noreply@node-react.com",
                to: email,
                subject: "Password reset instructions",
                text: `Please use the following link to reset your password: ${process.env.CLIENT_URL}/reset-password/${token}`,
                html: `<p>Please use the following link to reset your password: </p> <p>${
                    process.env.CLIENT_URL}/reset-password/${token}</p>`
            }
            return user.updateOne({resetPasswordLink: token}, (err, success)=>{
                if(err){
                    return res.json({message: err})
                }else{sendEmail(emailData)
                return res.status(200).json({
                    message: `Email has been sent to ${email}. Follow the instructions to reset your password`
                })
            }
            })
        
    })
}

exports.resetPassword=(req, res)=>{
    const {resetPasswordLink, newPassword}= req.body.resetInfo
    User.findOne({resetPasswordLink:resetPasswordLink.resetPasswordToken}, (err, user)=>{
        if(err || !user)
            return res.status(401).json({
                error: "Invalid link"
            })
        const updatedFields = {
            password: newPassword,
            resetPasswordLink: ""
    }
            user=_.extend(user, updatedFields)
            user.updated=Date.now()
            user.save((err, result)=>{
                if(err){
                    return res.status(400).json({
                        error:err
                    })
                }
                res.json({
                    message: "Great! Now you can login with your new password"
                })
            })
        
    })
}

exports.socialLogin = (req, res) => {
    let user = User.findOne({email: req.body.email}, (err, user)=>{
        if(err || !user){
            user = new User(req.body)
            req.profile = user
            user.save()
            const token = jwt.sign(
                {_id: user._id, iss: "NODEAPI"},
                process.env.JWT_SECRET
            )
            res.cookie("t", token, {expire: new Date()+ 9999})
            const {_id, username, email} =user
            return res.json({token, user: {_id, username, email}})
        }else{
            req.profile =useruser= _.extend(user, req.body)
            user.updated = Date.now()
            user.save()
            const token = jwt.sign(
                {_id: user._id, iss: "NODEAPI"},
                process.env.JWT_SECRET
            )
            res.cookie("t", token, {expire: new Date()+ 9999})
            const {_id, username, email} = user
            return res.json({token, user: {_id, username, email}})
        }
    })

}