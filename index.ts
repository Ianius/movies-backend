import { Config } from './utils/config';
import { Logger } from './utils/logger';

import cors from "cors";
import express from 'express';

import MovieRoute from "./routes/movies";
import AuthRoute from "./routes/auth";

const app = express();
const port = Config.PORT;
const origin = 
    Config.NODE_ENV === "development"
        ? "http://localhost:3000"
        : "https://movies-chi-neon.vercel.app"

app.use(cors({ origin }));
app.use(express.json());

app.use("/api/movies", MovieRoute);
app.use("/api/auth", AuthRoute);

app.listen(port, () => Logger.info(`Server running at port ${port}`));
