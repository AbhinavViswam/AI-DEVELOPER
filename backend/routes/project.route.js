import {Router} from "express"
import { createProject,showProject } from "../controller/project.controller.js";
import { authMiddleware } from "../middleware/auth.middleware.js";

const router=Router();

router.route("/create")
.post(authMiddleware,createProject);

router.route("/")
.get(authMiddleware,showProject)

export default router;