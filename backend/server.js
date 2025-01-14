import dotenv from "dotenv"
import jwt from "jsonwebtoken"
import http from "http"
import Project from "./models/project.model.js";
import { Server } from "socket.io";

import app from "./app.js";
import DB_CONNECT from "./db/db.js";

dotenv.config();
DB_CONNECT()

const server=http.createServer(app)
const io = new Server(server,{
    cors:{
        origin:"*"
    }
});

io.use(async(socket,next)=>{
    const token=socket.handshake.auth?.token || socket.handshake.headers.authorization?.split(" ")[1];
    
    const projectId = socket.handshake.query.projectId;
    socket.project=await Project.findById(projectId);

    if(!token){
        return next(new Error("unauthorized"));
    }
    const decoded=jwt.verify(token,process.env.JWT_SECRET);
    if(!decoded){
        return next(new Error("unauthorized"));
    }
    socket.user=decoded
    next();
})

io.on('connection',socket => {
    socket.roomId=socket.project._id.toString();
    console.log("a user connected...");
    socket.join(socket.roomId);


    socket.on('project-message', data => {
        console.log(data);
        socket.broadcast.to(socket.roomId).emit('project-message', data);
    });

socket.on('event', data => { /* … */ });
socket.on('disconnect', () => { /* … */ });
});

const port=process.env.PORT || 3000

server.listen(port,()=>{
    console.log(`running on port ${port}`);
})
