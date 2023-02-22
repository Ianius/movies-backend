import { Request, Response } from "express";
import { Config } from "../utils/config";
import { sendJsonResponse } from '../utils/network';
import { getApiConfiguration } from './tmdb-api-configuration';
import { AuthResponseLocals } from "./auth";

const BASE_URL = 'https://api.themoviedb.org/3';
const API_KEY = `api_key=${Config.API_KEY}`;
const LANGUAGE = 'language=en-US';

import connection from '../database/connection';
import { OkPacket, RowDataPacket } from "mysql2";

type SearchRequest = Request<{}, {}, {}, { q: string; page: number; }>;
type ImageRequest = Request<{}, {}, {}, { size?: string; filePath: string; }>;
type MovieRequest = Request<{ id: string; }>;
type MovieReviewsRequest = Request<{ id: string; }, {}, {}, { page: number; }>;
type PostReviewRequest = Request<{}, {}, { movieId: string; review: string; }>;
type PostListRequest = Request<{ id: string }, {}, { movieId: string; listName: string; }>;

interface Count extends RowDataPacket {
    count: number;
}

interface List extends RowDataPacket {
    id: number;
    name: string;
}

interface ListMovie extends RowDataPacket {
    id: number;
    movie_id: number;
}

export const getImage = async (req: ImageRequest, res: Response) => {
    const { size = 'w300', filePath } = req.query;

    if (!filePath) {
        return res
            .status(400)
            .json({ error: true, status_message: "No file path provided" });
    }

    const config = await getApiConfiguration(BASE_URL, API_KEY);
    const baseUrl = config.images.base_url;

    res.json({ url: `${baseUrl}/${size}/${filePath}` });
};

export const getPopular = (_: Request, res: Response) =>
    sendJsonResponse(
        res, 
        `${BASE_URL}/movie/popular?${API_KEY}&${LANGUAGE}&page=1`,
        "Couldn't fetch popular movies");

export const getTrending = (_: Request, res: Response) =>
    sendJsonResponse(
        res, 
        `${BASE_URL}/trending/movie/week?${API_KEY}`,
        "Couldn't fetch trending movies");

export const getGenres = (_: Request, res: Response) =>
    sendJsonResponse(
        res,
        `${BASE_URL}/genre/movie/list?${API_KEY}&${LANGUAGE}`,
        "Couldn't fetch genres"
    );

export const getSearch = (req: SearchRequest, res: Response) =>
    sendJsonResponse(
        res,
        `${BASE_URL}/search/movie?${API_KEY}&${LANGUAGE}&query=${req.query.q}&page=${req.query.page}&include_adult=false`,
        "Couldn't fetch search"
    );

export const getMovie = (req: MovieRequest, res: Response) => {
    const { id } = req.params;

    if (!id) {
        return res
            .status(400)
            .json({ error: true, status_message: "Invalid movie ID" });
    }

    sendJsonResponse(
        res,
        `${BASE_URL}/movie/${id}?${API_KEY}&${LANGUAGE}`,
        "Couldn't fetch movie"
    );
}

export const getSimilar = (req: MovieRequest, res: Response) => {
    const { id } = req.params;

    if (!id) {
        return res
            .status(400)
            .json({ error: true, status_message: "Invalid movie ID" });
    }

    sendJsonResponse(
        res,
        `${BASE_URL}/movie/${id}/similar?${API_KEY}&${LANGUAGE}&page=1`,
        "Couldn't fetch similar movies"
    );
}

export const getCredits = (req: MovieRequest, res: Response) => {
    const { id } = req.params;

    if (!id) {
        return res
            .status(400)
            .json({ error: true, status_message: "Invalid movie ID" });
    }

    sendJsonResponse(
        res,
        `${BASE_URL}/movie/${id}/credits?${API_KEY}&${LANGUAGE}`,
        "Couldn't fetch movie credtis"
    );
}

export const getReviews = async (req: MovieReviewsRequest, res: Response) => {
    const pageSize = 3;
    const { id } = req.params;
    const { page } = req.query;

    if (!(id && page)) {
        return res
            .status(400)
            .json({ error: true, status_message: "Invalid page or movie ID" });
    }

    const [reviews] = await connection.query(
        "SELECT reviews.review, users.username\n" +
        "FROM reviews\n" +
        "JOIN users\n" +
        "ON reviews.user_id = users.id\n" +
        "WHERE reviews.movie_id = ?\n" +
        "ORDER BY reviews.date DESC\n" +
        "LIMIT ?, ?", [id, (page - 1) * pageSize, pageSize]);

    const [count] = await connection.query<Count[]>("SELECT COUNT(*) AS count FROM reviews WHERE reviews.movie_id = ?", [id]);

    const reviewCount = count[0].count;
    const pageCount = Math.ceil(reviewCount / pageSize);

    res
        .status(200)
        .json({ page: page, reviews, page_count: pageCount });
};

export const postReview = async (req: PostReviewRequest, res: Response) => {
    const { user } = res.locals as AuthResponseLocals;
    const { movieId, review } = req.body;

    if (!(movieId && review)) {
        return res
            .status(400)
            .json({ error: true, status_message: "Invalid review or movie ID" });
    }

    const userId = user.id;

    await connection.query("INSERT INTO reviews(movie_id, review, user_id, date) VALUES(?, ?, ?, NOW())", [movieId, review, userId]);

    res
        .status(200)
        .json({ status_message: "Review posted successfully" });
};

export const getAllLists = async (_: Request, res: Response) => {
    const { user } = res.locals as AuthResponseLocals;
    const userId = user.id;

    const sql =
        "SELECT *\n" +
        "FROM lists\n" + 
        "WHERE lists.user_id = ?";

    const [rows] = await connection.query<List[]>(sql, [userId]);

    res
        .status(200)
        .json({ 
            favorites_id: rows.find(({ name }) => name === "Favorites")!.id,
            watchlist_id: rows.find(({ name }) => name === "Watchlist")!.id,
            results: rows
        });
};

export const getItemStatus = async (req: Request, res: Response) => {
    const { user } = res.locals as AuthResponseLocals;
    const { id } = req.params;
    const { item_id } = req.query;

    if (!(id && item_id)) {
        return res
            .status(400)
            .json({ error: true, status_message: "Invalid list ID or movie ID" });
    }

    const sql =
        "SELECT *\n" +
        "FROM lists\n" + 
        "JOIN list_movies\n" +
        "ON list_movies.list_id = lists.id AND list_movies.movie_id = ?\n" +
        "WHERE lists.id = ? AND lists.user_id = ?";

    const [rows] = await connection.query<(List & ListMovie)[]>(sql, [item_id, id, user.id]);

    res
        .status(200)
        .json({ item_status: rows.length > 0 });
};

export const getItemAnyStatus = async (req: Request, res: Response) => {
    const { user } = res.locals as AuthResponseLocals;
    const { item_id } = req.query;

    if (!item_id) {
        return res
            .status(400)
            .json({ error: true, status_message: "Invalid item id" });
    }

    const sql =
        "SELECT *\n" +
        "FROM lists\n" + 
        "JOIN list_movies\n" +
        "ON list_movies.list_id = lists.id AND list_movies.movie_id = ?\n" +
        "WHERE lists.user_id = ? AND lists.name <> 'Favorites' AND lists.name <> 'Watchlist'";

    const [rows] = await connection.query<(List & ListMovie)[]>(sql, [item_id, user.id]);

    res
        .status(200)
        .json({ item_status: rows.length > 0 });
};

export const createList = async (req: Request, res: Response) => {
    const { user } = res.locals as AuthResponseLocals;
    const { name } = req.body;

    if (!name || name.length === 0) {
        return res
            .status(400)
            .json({ error: true, status_message: "Invalid name" });
    }

    const [lists] = await connection.query<List[]>("SELECT * FROM lists WHERE lists.name = ? AND lists.user_id = ?", [name, user.id]);

    if (lists.length > 0) {
        return res
            .status(400)
            .json({ error: true, status_message: "List already exists" });
    }

    await connection.query<OkPacket>("INSERT INTO lists(name, user_id) VALUES (?, ?)", [name, user.id]);

    return res
        .status(200)
        .json({ status_message: "List created successfully" });
};

export const deleteList = async (req: Request, res: Response) => {
    const { user } = res.locals as AuthResponseLocals;
    const { id } = req.query;

    if (!id) {
        return res
            .status(400)
            .json({ error: true, status_message: "Invalid list ID" });
    }

    const [lists] = await connection.query<List[]>("SELECT * FROM lists WHERE lists.id = ? AND lists.user_id = ?", [id, user.id]);

    if (lists.length === 0) {
        return res
            .status(400)
            .json({ error: true, status_message: "List doesn't exist" });
    }

    await connection.query<OkPacket>("DELETE FROM lists WHERE lists.id = ? AND lists.user_id = ?", [id, user.id]);

    return res
        .status(200)
        .json({ status_message: "List deleted successfully" });
};

export const addToList = async (req: PostListRequest, res: Response) => {
    const { user } = res.locals as AuthResponseLocals;
    const { movieId } = req.body;
    const { id } = req.params;

    if (!(movieId && id)) {
        return res
            .status(400)
            .json({ error: true, status_message: "Invalid list name or movie ID" });
    }

    // Check if the list exists first
    const [lists] = await connection.query<List[]>("SELECT * FROM lists WHERE lists.user_id = ? AND lists.id = ?", [user.id, id]);

    if (lists.length === 0) {
        return res
            .status(400)
            .json({ error: true, status_message: "List doesn't exist" });
    }

    console.log("Trying to add movie: ", movieId, " to list: ", id);

    const [listMovies] = await connection.query<ListMovie[]>("SELECT * FROM list_movies WHERE list_movies.list_id = ? AND list_movies.movie_id = ?", [id, movieId]);

    if (listMovies.length > 0) {
        return res
            .status(400)
            .json({ error: true, status_message: "Movie is already in the list" });
    }

    await connection.query<OkPacket>("INSERT INTO list_movies(list_id, movie_id) VALUES (?, ?)", [id, movieId]);

    res
        .status(200)
        .json({ status_message: "Movie added to list" });
};

export const deleteFromList = async (req: Request, res: Response) => {
    const { user } = res.locals as AuthResponseLocals;
    const { id } = req.params;
    const { item_id } = req.query;

    if (!(id && item_id)) {
        return res
            .status(400)
            .json({ error: true, status_message: "Invalid id or item id"} );
    }

    const [lists] = await connection.query<RowDataPacket[]>("SELECT * FROM lists WHERE lists.user_id = ? AND lists.id = ?", [user.id, id]);

    if (lists.length === 0) {
        return res
            .status(400)
            .json({ error: true, status_message: "List not found" });
    }

    const list = lists[0];

    await connection.query<OkPacket>("DELETE FROM list_movies WHERE list_movies.list_id = ? AND list_movies.movie_id = ?", [list.id, item_id]);

    res
        .status(200)
        .json({ status_message: "Movie removed from list" });
};

const getListItemsForUser = async (userId: number, listId: number): Promise<ListMovie[]> => {
    const [lists] = await connection.query<List[]>("SELECT * FROM lists WHERE lists.user_id = ? AND lists.id = ?", [userId, listId]);

    if (lists.length === 0) {
        throw new Error(`List for user: ${userId} with ID: ${listId} not found`);
    }

    const list = lists[0];

    const [results] = await connection.query<ListMovie[]>("SELECT * FROM list_movies WHERE list_movies.list_id = ?", [list.id]);

    return results;
};

export const getListDetails = async (req: Request, res: Response) => {
    const { user } = res.locals as AuthResponseLocals;
    const { id } = req.params;

    if (!id) {
        return res
            .status(400)
            .json({ error: true, status_message: "Invalid list ID" });
    }

    const [lists] = await connection.query<List[]>("SELECT * FROM lists WHERE lists.user_id = ? AND lists.id = ?", [user.id, id]);

    if (lists.length === 0) {
        return res
            .status(400)
            .json({ error: true, status_message: "List doesn't exist" });
    }

    const results = await getListItemsForUser(user.id, parseInt(id));

    res
        .status(200)
        .json({ id, results });
};
