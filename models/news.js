const mongoose = require("mongoose")
const { ObjectId } = mongoose.Schema

const newsSchema = new mongoose.Schema({
    body: {
        type: String,
        required: true,
        minlength: 1,
        maxlength: 160
    },
    photo: {
        data: Buffer,
        contentType: String
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
})

module.exports = mongoose.model("New", newsSchema)