import { NextFunction, Request, Response } from "express";
import { Config } from "../utils/config";
import fetch from "node-fetch";

const BASE_URL = 'https://api.themoviedb.org/3';
const API_KEY = `api_key=${Config.API_KEY}`;
const LANGUAGE = 'language=en-US';

interface SearchQuery {
    q: string;
}

interface MovieIdParams {
    id: string;
}

export namespace MoviesController {
    export async function popular(_: Request, res: Response, next: NextFunction) {
        const URL = `${BASE_URL}/movie/popular?${API_KEY}&${LANGUAGE}&page=1`;

        try {
            res.send(await (await fetch(URL)).json());
        } catch (e) {
            next(e);
        }
    }

    export async function trending(_: Request, res: Response, next: NextFunction) {
        const URL = `${BASE_URL}/trending/movie/day?${API_KEY}`;

        try {
            res.send(await (await fetch(URL)).json());
        } catch (e) {
            next(e);
        }
    }

    export async function genres(_: Request, res: Response, next: NextFunction) {
        const URL = `${BASE_URL}/genre/movie/list?${API_KEY}&${LANGUAGE}`;

        try {
            res.send(await (await fetch(URL)).json());
        } catch (e) {
            next(e);
        }
    }

    export async function search(req: Request<{}, {}, {}, SearchQuery>, res: Response, next: NextFunction) {
        const URL = `${BASE_URL}/search/movie?${API_KEY}&${LANGUAGE}&query=${req.query.q}&page=1&include_adult=false`;

        try {
            res.send(await (await fetch(URL)).json());
        } catch (e) {
            next(e);
        }
    }

    export async function movie(req: Request<MovieIdParams>, res: Response, next: NextFunction) {
        const URL = `${BASE_URL}/movie/${req.params.id}?${API_KEY}&${LANGUAGE}`;

        try {
            res.send(await (await fetch(URL)).json());
        } catch (e) {
            next(e);
        }
    }

    export async function similarMovies(req: Request<MovieIdParams>, res: Response, next: NextFunction) {
        const URL = `${BASE_URL}/movie/${req.params.id}/similar?${API_KEY}&${LANGUAGE}&page=1`;

        try {
            res.send(await (await fetch(URL)).json());
        } catch (e) {
            next(e);
        }
    }

    export async function credits(req: Request<MovieIdParams>, res: Response, next: NextFunction) {
        const URL = `${BASE_URL}/movie/${req.params.id}/credits?${API_KEY}&${LANGUAGE}`;

        try {
            res.send(await (await fetch(URL)).json());
        } catch (e) {
            next(e);
        }
    }
}
