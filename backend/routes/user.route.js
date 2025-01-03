import { Router } from "express";

import * as userController from "../controller/user.controller.js";
import { authMiddleware } from "../middleware/auth.middleware.js";

const router=Router();

router.route("/register")
.post(userController.createUserController)

router.route("/login")
.post(userController.userLogin)

router.route("/profile")
.get(authMiddleware,userController.userProfile)

router.route("/logout")
.get(authMiddleware,userController.userLogout)

export default router