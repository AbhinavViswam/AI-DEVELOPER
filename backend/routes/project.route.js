import {Router} from "express"
import { createProject,showProject, addProjectPartner, showProjectById, updateFileTree, deleteProject} from "../controller/project.controller.js";
import { authMiddleware } from "../middleware/auth.middleware.js";

const router=Router();

router.route("/create")
.post(authMiddleware,createProject);

router.route("/")
.get(authMiddleware,showProject)

router.route("/delete/:id")
.delete(authMiddleware,deleteProject)

router.route("/addpartner/:id")
.put(authMiddleware,addProjectPartner)

router.route("/showmyproject/:pid")
.get(authMiddleware,showProjectById)

router.route("/updatefiletree")
.put(authMiddleware,updateFileTree)

export default router;