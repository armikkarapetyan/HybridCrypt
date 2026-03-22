import express from "express";
import cors from "cors";
import bodyParser from "body-parser";
import { env } from "./src/config/env.js";         
import { connectDB } from "./src/config/db.js";
import router from "./src/routes/message.js";
const app = express();

app.use(cors());
app.use(bodyParser.json());

app.use("/api/messages", router); 

connectDB();
app.listen(env.PORT, () => console.log(`Server started on: http://localhost:${env.PORT}`));