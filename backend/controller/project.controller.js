import Project from "../models/project.model.js"
import User from "../models/user.model.js"

export const createProject = async (req, res) => {
    try {
        const userEmail = req.user.email;
        const { projectName } = req.body;
        const user = await User.findOne({ email: userEmail });
        if (!user) {
            return res.status(404).json({ e: "User does not exist" });
        }
        const project = await Project.create({
            name: projectName,
            owner: [{ ownerid: user._id, ownerEmail: userEmail }],
            users: []
        });
        return res.status(200).json({ m: "Project Created", o: project });
    } catch (err) {
        console.error(err);
        return res.status(500).json({ e: "Internal server error" });
    }
};

export const showProject = async (req, res) => {
    try {
        const userEmail = req.user.email;
        const user = await User.findOne({ email: userEmail });
        if (!user) {
            return res.status(404).json({ e: "User does not exist" });
        }
        const project = await Project.find({
            $or: [
                { "users.userid": { $in: [user._id] } },
                { "owner.ownerid": { $in: [user._id] } }
            ]
        });
        if (!project) {
            return res.status(404).json({ e: "No projects found" });
        }
        res.status(200).json({ m: "Projects fetched", o: project });
    } catch (err) {
        console.error(err);
        return res.status(500).json({ e: "Internal server error" });
    }
};

export const addProjectPartner = async (req, res) => {
    try {
        const { id } = req.params;
        const userEmail = req.user.email;
        const { partnerEmail } = req.body;
        const user = await User.findOne({ email: userEmail });
        if (!user) {
            return res.status(404).json({ e: "User does not exist" });
        }
        const project = await Project.findById(id);
        if (!project) {
            return res.status(404).json({ e: "Project does not exist" });
        }
        const partner = await User.findOne({ email: partnerEmail });
        if (!partner) {
            return res.status(404).json({ e: "Partner does not exist" });
        }
        if (project.owner[0].ownerid.toString() !== user._id.toString()) {
            return res.status(401).json({ e: "You are not the owner of the project" });
        }
        if (project.users.includes(partner._id)) {
            return res.status(400).json({ e: "Partner already added" });
        }
        project.users.push({ userid: partner._id, userEmail: partnerEmail });
        await project.save();
        return res.status(200).json({ m: "Partner added", o: project });
    } catch (err) {
        console.error(err);
        return res.status(500).json({ e: "Internal server error" });
    }
};

export const showProjectById = async (req, res) => {
    try {
        const { pid } = req.params;
        const project = await Project.findById(pid);
        if (!project) {
            return res.status(404).json({ e: "Project does not exist" });
        }
        return res.status(200).json({ m: "Project fetched", o: project });
    } catch (err) {
        console.error(err);
        return res.status(500).json({ e: "Internal server error" });
    }
};