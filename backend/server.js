import dotenv from "dotenv"
import http from "http"

import app from "./app.js";
import DB_CONNECT from "./db/db.js";

dotenv.config();
DB_CONNECT()

const server=http.createServer(app)
const port=process.env.PORT || 3000

server.listen(port,()=>{
    console.log(`running on port ${port}`);
})
