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
        owner:user._id,
        userid:[]
    })
    return res.status(200).json({m:"Project Created",o:project})
}

export const showProject=async(req,res)=>{
    const userEmail=req.user.email
    console.log(userEmail);
    const user=await User.findOne({email:userEmail});
    if(!user){
        return res.status(404).json({e:"User doesnot exists"})
    }
    const project = await Project.find({
        $or: [
            { userid: { $in: [user._id] } }, 
            { owner: user._id }
        ]
    });
    if(!project){
        return res.status(404).json({e:"No projects created"})
    }
    res.status(200).json({m:"projects fetched",o:project})
}

export const addProjectPartner=async(req,res)=>{
    const {id} =req.params
    const userEmail = req.user.email
    const {partnerEmail}=req.body
    const user=await User.findOne({email:userEmail});
    if(!user){
        return res.status(404).json({e:"User doesnot exists"})
    }
    const project=await Project.findById(id);
    if(!project){
        return res.status(404).json({e:"Project doesnot exists"})
    }
    const partner=await User.findOne({
        email:partnerEmail
    });
    if(!partner){
        return res.status(404).json({e:"Partner doesnot exists"})
    }
    if(project.owner.toString() !== user._id.toString()){
        return res.status(401).json({e:"You are not the owner of the project"})
    }
    if(project.users.includes(partner._id)){
        return res.status(400).json({e:"Partner already added"})
    }
    project.users.push({userid:partner._id,userEmail:partnerEmail})
    await project.save()
    return res.status(200).json({m:"Partner added",o:project})
}

export const showProjectById=async(req,res)=>{
    const {pid}=req.params;
    const project=await Project.findById(pid);
    if(!project){
        return res.status(404).json({e:"Project does not exits"})
    }
    return res.status(200).json({m:"fetched",o:project})
}