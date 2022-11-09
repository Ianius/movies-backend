import { Router } from "express";
import { MoviesController } from "../controllers/movies";

const route = Router();

route.get('/popular', MoviesController.popular);
route.get('/trending', MoviesController.trending);
route.get('/genres', MoviesController.genres);

export default route;
