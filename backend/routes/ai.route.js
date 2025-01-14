import { getResult } from "../controller/ai.controller.js";
import { Router } from "express";
const router=Router()

router.route("/get-result").get(getResult)

export default router