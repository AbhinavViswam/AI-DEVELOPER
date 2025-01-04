import express from "express"
import cookieParser from "cookie-parser"
import cors from "cors"

import userRoute from "./routes/user.route.js"

const app=express()

app.use(express.json())
app.use(express.urlencoded({extended:true}))
app.use(cookieParser())
app.use(cors())

app.use('/users',userRoute)

export default app