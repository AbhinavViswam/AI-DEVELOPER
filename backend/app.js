import express from "express"
import cookieParser from "cookie-parser"
import cors from "cors"
import path from "path"

import userRoute from "./routes/user.route.js"
import projectRoute from "./routes/project.route.js"
import aiRoute from "./routes/ai.route.js"

const app=express()

app.use(express.json())
app.use(express.urlencoded({extended:true}))
app.use(cookieParser())
app.use(cors())

app.use('/users',userRoute)
app.use("/project",projectRoute)
app.use("/ai",aiRoute)

app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, 'frontend', 'dist', 'index.html'));
  });
  

export default app