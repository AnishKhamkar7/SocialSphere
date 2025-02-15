import { User } from "../models/user.model.js"
import cookieParser from "cookie-parser"
import jwt from "jsonwebtoken"

const generateAcesssandRefreshToken = (async(UserId)=>{
   try {

    const user = await User.findById(UserId)
    const accessToken = await user.generateAccessToekn()
    const refreshToken = await user.generateRefreshToekn()

    user.refreshToken = refreshToken
    await user.save({validateBeforeSave:false})

    return { accessToken,refreshToken }

 
   } catch (error) {

    console.log(error)

   }
})



const registerUser = (async(req,res)=>{
    try {
        //get details from req.body
        const { username,password,email } = req.body


        //check if all the required fields are filled
        if(!username || !password || !email){
            return res
            .status(400)
            .json("All Fields are required")
        }

        //check if the user is already in the databse or not

        const userAvail = await User.findOne({
            $or:[{username},{email}]
        })

        //if found then return user already exists

        if (userAvail) {
            return res
            .status(409)
            .json("Username or email already exists")
        }

        //save the data into the model



        const user = await User.create({
            username: username,
            password: password,
            email: email
        })
        //find the user into the database and if not return error
        const createdUser = await User.findById(user._id).select("-password -refreshToken")

        if (!createdUser) {
            return res
            .status(500)
            .json({
                message: "Something went wrong"
            })
        }

        return res.status(200)
        .json(createdUser)


    } catch (error) {
        res
        .status(500)
        .json({
                message: error.message
            })
        
    }
})


const loginUser = (async(req,res)=>{
    try {
        const { username, email, password } = req.body

    const checkUser = await User.findOne({
        $or:[{username},{email}]
    })

    if(!checkUser){
        return res
        .status(400)
        .json("User does not exists")
    }

    const check = await checkUser.isPasswordCorrect(password)


    if(!check){
        return res.status(404).json("Incorrect password")
    }

    const {accessToken,refreshToken} = await generateAcesssandRefreshToken(checkUser._id)

    const loggedInuser = await User.findById(checkUser._id).select( "-password -refreshToken")

    const options = {
        httyOnly: true,
        secure: true
    }

    res
    .status(200)
    .cookie("AccesToken",accessToken,options)
    .cookie("RefreshToken",refreshToken)
    .json(loggedInuser,accessToken,refreshToken)

    } catch (error) {
        res.status(400).json({messgae:error.message})
    }
})

// const userProfile = async(req,res)=>{
//     const user = req.body
// }

const updateProfile = async(req,res) =>{
    try {
        const user = req.user; 

        const { username, password } = req.body;
    
        if (!username && !password) {
            return res.status(400).json({
                message: "Both username and password fields are empty"
            });
        }
    
        if (username && username === user.username) {
            return res.status(400).json({
                message: "New username is the same as the current username"
            });
        }

        if (username) {
            const existingUser = await User.findOne({ username });
    
            if (existingUser) {
                return res.status(400).json({
                    message: "Username already exists"
                });
            }
    
            user.username = username;
            const updatedUser = await user.save(); 
    
            if (!updatedUser) {
                message: "Username update failed"
                return res.status(400).json({
            });
            }

        }

        if (password) {
            const isPasswordCorrect = await user.isPasswordCorrect(password);
    
            if (isPasswordCorrect) {
                return res.status(400).json({
                    message: "New password cannot be the same as the current password"
                });
            }
            
            user.password = password;
            
            const updatedUserWithPassword = await user.save(); 
            if (!updatedUserWithPassword) {
            return res.status(400).json({
                    message: "Password update failed"
                });
            }
        }
        
        return res.status(200).json({
        message: "Profile updated successfully"
    });
    } catch (error) {
        return res.status(500).json({
            message: error.message
        });
    }
 

}



export { registerUser, loginUser,updateProfile }