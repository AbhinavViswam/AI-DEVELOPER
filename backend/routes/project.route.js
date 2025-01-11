import {Router} from "express"
import { createProject,showProject, addProjectPartner, showProjectById } from "../controller/project.controller.js";
import { authMiddleware } from "../middleware/auth.middleware.js";

const router=Router();

router.route("/create")
.post(authMiddleware,createProject);

router.route("/")
.get(authMiddleware,showProject)

router.route("/addpartner/:id")
.put(authMiddleware,addProjectPartner)

router.route("/showmyproject/:pid")
.get(authMiddleware,showProjectById)

export default router;