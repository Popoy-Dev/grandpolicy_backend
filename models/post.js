const mongoose = require("mongoose")
const { ObjectId } = mongoose.Schema

const postSchema = new mongoose.Schema(
    {
    title: {
        type: String,
        required: true
    },
    body: {
        type: String,
        required: true,
        minlength: 1,
        maxlength: 2000
    },
    photo: {
        type: String
    },
    postedBy: {
        type: ObjectId,
        ref: "User"
    },
    created: {
        type: Date,
        default: Date.now
    },
    updated: Date,
    likes: [{ type: ObjectId, ref: "User" }],
    comments: [{
        text: String,
        created: { type: Date, default: Date.now },
        postedBy: { type: ObjectId, ref: "User" }
    }]
})

postSchema.index({'$**': 'text'});



module.exports = mongoose.model("Post", postSchema)