const express = require('express')
const {getNews, createNew, newsByUser, newById, isPoster, deleteNew, updateNew, photo, singleNew, like, unlike, newsForTimeline, newsTime} =require('../controllers/news')
const {requireSignin} =require('../controllers/auth')
const {createNewValidator} = require('../validator')
const {userById} =require('../controllers/user')


const router = express.Router()

router.get('/news',requireSignin, newsTime)
router.put('/new/like', requireSignin, like )
router.put('/new/unlike', requireSignin, unlike )



router.post('/new/new/:userId', requireSignin, createNew )

router.get("/news/by/:userId",requireSignin, newsByUser)


router.put("/news/:newId", requireSignin, isPoster, updateNew)
router.delete('/new/:newId', requireSignin, isPoster, deleteNew)
router.get('/new/photo/:newId', photo)
router.get('/new/:newId', singleNew)


router.param('userId', userById)

router.param("newId", newById)


module.exports=router