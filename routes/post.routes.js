import { Router } from "express";
import { Uploadtext, ViewPosts, viewSinglePost, } from "../controllers/post.controller.js";
import { uploadComment } from "../controllers/comment.controllers.js";
import { registerUser, loginUser } from "../controllers/user.controllers.js";
import { vertfyJWT } from "../middlewares/auth.middleware.js";
import { LikeComment, LikePost, UnlikePost } from "../controllers/likes.controllers.js";
import { followUser, unfollowUser } from "../controllers/followers.controller.js";


const router = Router()
// upload text
router.route('/textpost/upload').post(vertfyJWT,Uploadtext)

//upload comments on sepcific post with epcific account
router.route("/comment/:_id").post(vertfyJWT,uploadComment)

//register user
router.route("/register").post(registerUser)

//user login
router.route("/login").post(loginUser)

//like post
router.route("/textpost/like/:_id").post(vertfyJWT,LikePost)

//like comment
router.route("/comment/like/:_id").post(vertfyJWT,LikeComment)

//unlike post
router.route("/textpost/unlike/:_id").post(vertfyJWT,UnlikePost)

//follow User
router.route("/follow/:_id").post(vertfyJWT,followUser)

// unfollow User
router.route("/unfollow/:_id").post(vertfyJWT,unfollowUser)



export default router