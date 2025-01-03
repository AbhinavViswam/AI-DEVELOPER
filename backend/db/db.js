import mongoose from "mongoose";

async function DB_CONNECT() {
    await mongoose.connect(process.env.DB_URI)
    console.log("DB CONNECTED");
}

export default DB_CONNECT