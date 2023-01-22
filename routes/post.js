const express = require('express')
const {getPosts, createPost, postsByUser, postById, isPoster, deletePost, updatePost, photo, singlePost, like, unlike, comment, uncomment, listSearch, lookfor,listBySearch,getPage} =require('../controllers/post')
const {requireSignin} =require('../controllers/auth')
const {createPostValidator} = require('../validator')
const {userById} =require('../controllers/user')



const router = express.Router()

router.get('/posts', getPosts)
router.put('/post/like', requireSignin, like )
router.put('/post/unlike', requireSignin, unlike )

router.put("/post/comment", requireSignin, comment)
router.put("/post/uncomment", requireSignin, uncomment)

router.post('/post/new/:userId', requireSignin, createPost )

router.get("/posts/by/:userId",requireSignin, postsByUser)
router.get("/posts/search", listSearch)


router.put("/posts/:postId", requireSignin, isPoster, updatePost)
router.delete('/post/:postId', requireSignin, isPoster, deletePost)
router.get('/post/photo/:postId', photo)
router.get('/post/:postId', singlePost)


router.param('userId', userById)


router.param("postId", postById)


module.exports=router
