import User from "../models/user.model.js"

export const createUserController =async(req,res)=>{
    const {email,password}=req.body
    if(!email || !password){
        return res.status(400).json({e:"All fields are required"})
    }
    const hashedPassword=await User.hashPassword(password)
    const user=await User.create({
        email,
        password:hashedPassword
    })
    delete user._doc.password
    return res.status(200).json({m:"user registered", o:user})
}

export const userLogin =async(req,res)=>{
    const {email,password}=req.body
    if(!email || !password){
        return res.status(400).json({e:"All fields are required"})
    }
    const user=await User.findOne({email})
    if(!user){
        return res.status(404).json({e:"User not found"})
    }
    const isValid=await user.isValidPassword(password)
    if(!isValid){
        return res.status(400).json({e:"Invalid credentials"})
    }
    const token=user.generateJWT()
    res.cookie('token',token,{httpOnly:true})
    delete user._doc.password
    return res.status(200).json({m:"User logged in",o:user,token})
}

export const userProfile=async(req,res)=>{
    return res.status(200).json({m:"User profile",o:req.user})
}

export const userLogout=async(req,res)=>{
    res.cookie("token","")
    return res.status(200).json({m:"User logged out"})
}