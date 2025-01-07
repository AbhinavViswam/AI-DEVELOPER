import {Router} from "express"
import { createProject,showProject, addProjectPartner } from "../controller/project.controller.js";
import { authMiddleware } from "../middleware/auth.middleware.js";

const router=Router();

router.route("/create")
.post(authMiddleware,createProject);

router.route("/")
.get(authMiddleware,showProject)

router.route("/addpartner/:id")
.put(authMiddleware,addProjectPartner)

export default router;