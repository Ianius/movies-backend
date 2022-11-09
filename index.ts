import express from 'express';
import { Config } from './utils/config';
import cors from "cors";
import movieRoute from "./routes/movies";

const app = express();
const port = Config.PORT;

app.use(
    cors({
        origin:
            Config.NODE_ENV === "development"
                ? "http://localhost:3000"
                : "http://localhost"
    })
);

app.get('/', (req, res, next) => {
    res.send('Express + typescript server');
});

app.use("/api/movies", movieRoute);

app.listen(port, () => console.log(`[SERVER]: Server running at http://localhost:${port}`));
