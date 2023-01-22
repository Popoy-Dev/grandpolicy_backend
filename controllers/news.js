const News = require('../models/news')
const Users = require('../models/user')
const formidable = require('formidable')
const fs = require('fs')
const _ = require('lodash')
const { createPostValidator } = require('../validator')
const { db } = require('../models/news')
const { get } = require('lodash')




exports.newById = (req, res, next, id) => {
    console.log(id);
    News.findById(id)
        .populate("postedBy", "_id username")
        .populate("postedBy", "_id username")
        .select("_id body created likes photo")
        .exec((err, newItem) => {
            if (err || !newItem) {
                return res.status(400).json({
                    error: err
                })
            }
            req.newItem = newItem
            next()
        })
}
//yours


exports.createNew = (req, res, next) => {
    let form = new formidable.IncomingForm()
    form.keepExtensions = true
    form.parse(req, (err, fields, files) => {
        console.log(files);
        console.log(fields);
        const checkBody = createPostValidator(fields)
        if (checkBody.error) {
            return res.status(400).json({
                error: checkBody.error
            })
        }
        if (err) {
            return res.status(400).json({
                error: "image could not be uploaded"
            })
        }
        let newItem = new News({
            body: fields.body,
            photo: '',
            postedBy: req.profile._id
        })

        req.profile.hashedPassword = undefined
        req.profile.salt = undefined

        newItem.postedBy = req.profile
        if (files.photo) {
            newItem.photo.data = fs.readFileSync(files.photo.path)
            newItem.photo.contentType = files.photo.type
        }
        newItem.save((err, result) => {
            console.log(result);
            if (err) {
                return res.status(400).json({ error: err })
            }
            res.json(result)
        })

    })
}

exports.newsByUser = (req, res) => {
    News.find({ postedBy: req.profile._id })
        .populate("postedBy", "_id username")
        .select("_id body created likes")
        .sort("_created")
        .exec((err, news) => {
            if (err) {
                return res.status(400).json({ error: err })
            }
            res.json(news)
        })
}

exports.isPoster = (req, res, next) => {
    let isPoster = req.newItem && req.auth && req.newItem.postedBy._id == req.auth._id
    if (!isPoster) {
        return res.status(403).json({
            error: "user is not authorized"
        })
    }
    next()
}

exports.updateNew = (req, res, next) => {
    let newItem = req.newItem
    newItem = _.extend(newItem, req.body)
    newItem.updated = Date.now()
    newItem.save(err => {
        if (err) {
            return res.status(400).json({
                error: err
            })
        }
        res.json(newItem)
    })
}


exports.deleteNew = (req, res) => {
    let newItem = req.newItem
    newItem.remove((err, newItem) => {
        if (err) {
            return res.status(400).json({
                error: err
            })
        }
        res.json({ message: "New item deleted succesfully" })
    })
}

exports.photo = (req, res, next) => {
    res.set("Content-Type", req.newItem.photo.contentType)
    console.log(req)
    return res.send(req.newItem.photo.data)
   
}

exports.singleNew = (req, res) => {
    return res.json(req.newItem)
}

exports.like = async (req, res) => {
    try {
        const like = await News.findByIdAndUpdate(req.body.newId, { $push: { likes: req.body.userId } }, { new: true })
        if (!like) {
            return res.status(400).json({ message: 'Failed' })
        }
        res.json(like)
    } catch (error) {
        console.log(error);
        res.status(500).json({ message: 'Internal Server Error' })
    }
}

exports.unlike = async (req, res) => {
    try {
        const unlike = await News.findByIdAndUpdate(req.body.newId, { $pull: { likes: req.body.userId } }, { new: true })
        if (!unlike) {
            return res.status(400).json({ message: 'Failed' })
        }
        res.json(unlike)
    } catch (error) {
        console.log(error);
        res.status(500).json({ message: 'Internal Server Error' })
    }
}

/*exports.comment =async(req, res)=>{
    let comment = req.body.comment
    comment.postedBy= req.body.userId

    try {
        const comment = await Post.findByIdAndUpdate(req.body.postId, { $push: { comments: comment } }, { new: true })
        if (!comment) {
            return res.status(400).json({ message: 'Failed' })
        }
        res.json(comment)
    } catch (error) {
        console.log(error);
        res.status(500).json({ message: 'Internal Server Error' })
    }
}

exports.uncomment =async(req, res)=>{
    let comment = req.body.comment

    try {
        const comment = await Post.findByIdAndUpdate(req.body.postId, { $pull: { comments: {_id: this.comment._id} } }, { new: true })
        if (!comment) {
            return res.status(400).json({ message: 'Failed' })
        }
        res.json(comment)
    } catch (error) {
        console.log(error);
        res.status(500).json({ message: 'Internal Server Error' })
    }
} */

/*exports.comment = (req, res) => {
    let comment = req.body.comment
    comment.postedBy = req.body.userId
    Post.findByIdAndUpdate(
        req.body.postId, { $push: { comments: {text:comment, postedBy : req.body.userId} } },
        { new: true }
    )
        .exec((err, result) => {
            console.log(err);
            if (err) {
                return res.status(400).json({
                    error: err
                })
            } else {
                return res.json(result)
            }
        })
}

exports.uncomment = (req, res) => {
    let comment = req.body.comment
    Post.findByIdAndUpdate(
        req.body.postId, { $pull: { comments: { _id: comment._id } } },
        { new: true }
    )/*.populate("comments.postedby", "_id username")
    .populate("postedby", "_id username")
        .exec((err, result) => {
            if (err) {
                return res.status(400).json({
                    error: err
                })
            } else {
                res.json(result)
            }
        })
       
   
}*/
exports.newsForTimeline = async(req, res) => {
    let following = req.profile.following
    following.push(req.profile._id)
    News.find({ postedBy: { $in: req.profile.following } })
        .populate('postedBy', '_id username')
        .sort({ created: -1 })
        .exec((err, news) => {
            if (err) {
                return res.status(400).json({
                    error: errorHandler.getErrorMessage(err)
                })
            }
            res.json(news)
        }
        )

}

exports.newsTime = async (req, res) => {
    const userId = req.auth._id
    const getUser = await Users.findById(userId)
    let following = getUser.following
    following.push(userId)
    try {
        const news = await News.find({ postedBy: { $in: following } }).populate('postedBy', '_id username')
            .sort({ created: -1 })
        if (!news) {
            return res.status(400).json({ message: 'Failed' })
        }
        res.json(news)
    } catch (error) {
        console.log(error);
        res.status(500).json({ message: 'Internal Server Error' })
    }
}


exports.getNews = (req, res) => {
    const news = News.find()
        .populate("postedBy", "_id username")
        .select("_id body created likes")
        .sort({ created: -1 })
        .then((news) => {
            res.json(news)
        })
        .catch(err => console.log(err))
}

