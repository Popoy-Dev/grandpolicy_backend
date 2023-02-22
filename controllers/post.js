const Post = require('../models/post')
const formidable = require('formidable')
const fs = require('fs')
const _ = require('lodash')
const { createPostValidator } = require('../validator')
const { filter, capitalize } = require('lodash')




exports.postById = (req, res, next, id) => {
    console.log(id);
    Post.findById(id)
        .populate("postedBy", "_id username")
        .populate("comments.postedBy", "_id username")
        .populate("postedBy", "_id username")
        .select("_id body created likes comments photo")
        .exec((err, post) => {
            if (err || !post) {
                return res.status(400).json({
                    error: err
                })
            }
            req.post = post
            next()
        })
}
//yours
/*exports.getPosts = (req, res) => {
    const posts = Post.find()
        .populate("postedBy", "_id username")
        .populate("comments", "text created")
        .select("_id body created likes title photo")
        .sort({ created: -1 })
        .then((posts) => {
            res.json(posts)
        })
        .catch(err => console.log(err))
} */
exports.getPosts = async (req, res) => {
    const perPage = 2;
    const { before, after } = req.query;
    
    let query = Post.find();
    let cursor = null;
  
    if (after) {
      cursor = after;
      query = query.where('_id').gt(after);
    } else if (before) {
      cursor = before;
      query = query.where('_id').lt(before);
    }
  
    const posts = await query
      .sort({ created: -1 })
      .limit(perPage)
      .select("_id title body created likes photo")
      .populate("comments", "text created")
      .populate("postedBy", "_id name")
      .lean();
      
    const totalItems = await Post.countDocuments();
  
    res.status(200).json({ posts, totalItems, cursor });
  };
exports.like = async (req, res) => {
    try {
        const like = await Post.findByIdAndUpdate(req.body.postId, { $push: { likes: req.body.userId } }, { new: true })
        if (!like) {
            return res.status(400).json({ message: 'Failed' })
        }
        res.json(like)
    } catch (error) {
        console.log(error);
        res.status(500).json({ message: error })
    }
}
exports.createPost = (req, res) => {
    try{
        let form = new formidable.IncomingForm()
        form.keepExtensions = true
        form.parse(req, (err, fields, files) => {
        console.log(fields);
        console.log(files);
       
        if (!fields.body || !fields.title) {
            return res.status(400).json({
                error: "invalid parameter"
            })
        }
        
        let post = new Post({
            title: fields.title,
            body: fields.body,
            photo: fields.file,
            postedBy: req.profile._id
        })

        req.profile.hashedPassword = undefined
        req.profile.salt = undefined

        post.postedBy = req.profile

        post.save((err, result) => {
            console.log('asdasdasdasdasd',result);
            if (err) {
                return res.status(400).json({ error: err })
            }
            res.json(result)
        })

    })
    }catch(error){
        console.log(error);
        res.status(500).json({ message: 'Internal Server Error' })
    }
}

exports.postsByUser = (req, res) => {
    Post.find({ postedBy: req.profile._id })
        .populate("postedBy", "_id username")
        .select("_id body created likes title")
        .sort("_created")
        .exec((err, posts) => {
            if (err) {
                return res.status(400).json({ error: err })
            }
            res.json(posts)
        })
}

exports.isPoster = (req, res, next) => {
    let isPoster = req.post && req.auth && req.post.postedBy._id == req.auth._id
    if (!isPoster) {
        return res.status(403).json({
            error: "user is not authorized"
        })
    }
    next()
}

exports.updatePost = (req, res, next) => {
    let post = req.post
    post = _.extend(post, req.body)
    post.updated = Date.now()
    post.save(err => {
        if (err) {
            return res.status(400).json({
                error: err
            })
        }
        res.json(post)
    })
}


exports.deletePost = (req, res) => {
    let post = req.post
    post.remove((err, post) => {
        if (err) {
            return res.status(400).json({
                error: err
            })
        }
        res.json({ message: "post deleted succesfully" })
    })
}

exports.photo = (req, res, next) => {
    res.set("Content-Type", req.post.photo.contentType)
    return res.send(req.post.photo.data)
}

exports.singlePost = (req, res) => {
    return res.json(req.post)
}

exports.like = async (req, res) => {
    try {
        const like = await Post.findByIdAndUpdate(req.body.postId, { $push: { likes: req.body.userId } }, { new: true })
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
        const unlike = await Post.findByIdAndUpdate(req.body.postId, { $pull: { likes: req.body.userId } }, { new: true })
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

exports.comment = (req, res) => {
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
    .populate("postedby", "_id username")*/
        .exec((err, result) => {
            if (err) {
                return res.status(400).json({
                    error: err
                })
            } else {
                res.json(result)
            }
        })
       
      
}


exports.listSearch = (req, res) => {
    const query = {};
    if (req.query.search) {
        query.name = { $regex: req.query.search,  $options: "i" };
         Post.find(query, (err, posts) => {
            if (err) {
                return res.status(400).json({
                    error: "error"
                });
            }
          const search = req.query?.search?.toString()
    if (search) {
        const postfilter = posts.filter(
            item => item.title.toLowerCase().includes(search?.toLowerCase()) || item.body.toLowerCase().includes(search?.toLowerCase())
        )
        res.json(postfilter)
    }
        })
        .populate("postedBy", "_id username")
        .select("_id title body created likes photo")
    }
    console.log(query)
};








  /*const filterData = posts.filter(item => item.title.includes(req.query.search) || item.body.includes(req.query.search))
            res.json(filterData); */




