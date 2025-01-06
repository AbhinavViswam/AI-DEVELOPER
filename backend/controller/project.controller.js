import Project from "../models/project.model.js"
import User from "../models/user.model.js"

export const createProject=async(req,res)=>{
    const userEmail=req.user.email
    const {projectName}=req.body
    const user=await User.findOne({email:userEmail});
    if(!user){
        return res.status(404).json({e:"User doesnot exists"})
    }
    const project= await Project.create({
        name:projectName,
        userid:user._id
    })
    return res.status(200).json({m:"Project Created",o:project})
}

export const showProject=async(req,res)=>{
    const userEmail=req.user.email
    const user=await User.findOne({email:userEmail});
    if(!user){
        return res.status(404).json({e:"User doesnot exists"})
    }
    const project=await Project.find({userid:{$in:[user._id]}});
    if(!project){
        return res.status(404).json({e:"No projects created"})
    }
    res.status(200).json({m:"projects fetched",o:project})
}

export const addProjectPartner=async(req,res)=>{
    const userEmail=req.user.email
    const projectid=req.params.id
    const user=await User.findOne({email:userEmail});
    if(!user){
        return res.status(404).json({e:"User doesnot exists"})
    }
    const project=await Project.findById(projectid)
    if(!project){
        return res.status(404).json({e:"Project with that id doesnot exists"})
    }
    
}
