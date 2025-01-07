import mongoose from "mongoose"

const projectSchema = new mongoose.Schema({
    name:{
        type:String
    },
    owner:{
        type:mongoose.Schema.Types.ObjectId,
        ref:"User"
    },
    userid:[{
        type:mongoose.Schema.Types.ObjectId,
        ref:"User"
    }]
})

const Project = mongoose.model("Project",projectSchema);
export default Project