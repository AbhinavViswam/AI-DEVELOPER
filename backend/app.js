import express from "express";
import cookieParser from "cookie-parser";
import cors from "cors";

import userRoute from "./routes/user.route.js";
import projectRoute from "./routes/project.route.js";
import aiRoute from "./routes/ai.route.js";

const app = express();

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());
app.use(
  cors({
    origin: process.env.FRONTEND || "http://localhost:3000",
    credentials: true,
  })
);

app.use("/users", userRoute);
app.use("/project", projectRoute);
app.use("/ai", aiRoute);

export default app;
