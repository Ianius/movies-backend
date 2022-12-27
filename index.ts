import express from 'express';
import { Config } from './utils/config';
import cors from "cors";
import movieRoute from "./routes/movies";
import { Logger } from './utils/logger';

const app = express();
const port = Config.PORT;
const origin = 
    Config.NODE_ENV === "development"
        ? "http://localhost:3000"
        : "https://movies-chi-neon.vercel.app"

app.use(
    cors({
        origin: origin
    })
);

Logger.info("Origin: ", origin);

app.use("/api/movies", movieRoute);

app.listen(port, () => Logger.info(`Server running at port ${port}`));