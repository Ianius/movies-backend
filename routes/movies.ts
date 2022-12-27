import { Router } from "express";
import { MoviesController } from "../controllers/movies";

const route = Router();

route.get('/popular', MoviesController.popular);
route.get('/trending', MoviesController.trending);
route.get('/genres', MoviesController.genres);
route.get('/search', MoviesController.search);
route.get('/movie/:id', MoviesController.movie);
route.get('/movie/:id/similar', MoviesController.similarMovies);
route.get('/credits/:id', MoviesController.credits);

export default route;
