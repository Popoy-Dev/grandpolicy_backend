const mongoose = require("mongoose")
const {v4: uuidv4} = require('uuid')
const crypto = require("crypto")
const {ObjectId} = mongoose.Schema
const Post = require("./post")

const userSchema = new mongoose.Schema({
    username:{
        type: String,
        trim: true,
        required: true,
        unique: true
    },
    email:{
        type: String,
        trim: true,
        required: true,
        unique: true
    },
    visible: {
        type: Boolean
    },
    hashedPassword:{
        type: String,
        required: true
    },
    salt: String,
    created: {
        type: Date,
        default: Date.now
    },
    updated: Date,
    about: {
        type: String,
        trim: true
    },
    following: [{type: ObjectId, ref: "User"}],
    followers: [{type: ObjectId, ref: "User"}],
    resetPasswordLink: {
        data: String,
        default: ""
    }
})

userSchema
    .virtual('password')
    .set(function(password){
    this._password = password
    this.salt = uuidv4(),
    this.hashedPassword=this.encryptedPassword(password)
    })
        .get(function(){
    return this._password
})

userSchema.methods={
    authenticate: function(plainText){
        return this.encryptedPassword(plainText) === this.hashedPassword
    },

    encryptedPassword: function(password){
        if(!password) return ""
        try {
            return crypto
                    .createHmac('sha1', this.salt)
                    .update(password)
                    .digest('hex')
        } catch (error) {
                return ""
        }
    }
}

userSchema.pre("remove", function(next){
    Post.remove({postedby: this._id}).exec()
    next()
})

module.exports= mongoose.model("User", userSchema)