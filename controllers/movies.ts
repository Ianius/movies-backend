import { NextFunction, Request, Response } from "express";
import { Config } from "../utils/config";
import fetch from "node-fetch";

const BASE_URL = 'https://api.themoviedb.org/3';

export namespace MoviesController {
    export async function popular(_: Request, res: Response, next: NextFunction) {
        const URL = `${BASE_URL}/movie/popular?api_key=${Config.API_KEY}&language=en-US&page=1`;

        try {
            res.send(await (await fetch(URL)).json());
        } catch (e) {
            next(e);
        }
    }

    export async function trending(_: Request, res: Response, next: NextFunction) {
        const URL = `${BASE_URL}/trending/movie/day?api_key=${Config.API_KEY}`;

        try {
            res.send(await (await fetch(URL)).json());
        } catch (e) {
            next(e);
        }
    }

    export async function genres(_: Request, res: Response, next: NextFunction) {
        const URL = `${BASE_URL}/genre/movie/list?api_key=${Config.API_KEY}&language=en-US`;

        try {
            res.send(await (await fetch(URL)).json())
        } catch (e) {
            next(e);
        }
    }
}
