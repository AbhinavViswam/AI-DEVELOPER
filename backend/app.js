import express from "express"
import cookieParser from "cookie-parser"
import cors from "cors"

import userRoute from "./routes/user.route.js"
import projectRoute from "./routes/project.route.js"

const app=express()

app.use(express.json())
app.use(express.urlencoded({extended:true}))
app.use(cookieParser())
app.use(cors())

app.use('/users',userRoute)
app.use("/project",projectRoute)

export default app