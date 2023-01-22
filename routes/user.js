const express = require('express')

const {userById, allUsers, getUser, updateUser, deleteUser, addFollowing, addFollower,removeFollowing,removeFollower,findPeople, userPhoto} =require('../controllers/user')
const {requireSignin} =require('../controllers/auth')



const router = express.Router()


router.get('/users', allUsers)
router.get('/user/:userId', requireSignin, getUser)
router.get('/user/photo/:userId', userPhoto)
router.put('/user/edit/:userId',requireSignin, updateUser)
router.delete('/user/:userId',requireSignin, deleteUser)
router.put('/user/follow/:userId', requireSignin, addFollowing, addFollower )
router.put('/user/unfollow/:userId', requireSignin, removeFollowing, removeFollower )
router.get('/user/findpeople/:userId', requireSignin, findPeople)




router.param('userId', userById)



module.exports=router