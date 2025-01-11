import mongoose from "mongoose"

const projectSchema = new mongoose.Schema({
    name:{
        type:String
    },
    owner:{
        type:mongoose.Schema.Types.ObjectId,
        ref:"User"
    },
    users:[{
       userid: {
        type:mongoose.Schema.Types.ObjectId,
        ref:"User"
    },
    userEmail:{
        type:String,
    }
}]
})

const Project = mongoose.model("Project",projectSchema);
export default Project