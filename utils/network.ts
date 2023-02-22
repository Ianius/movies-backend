import { Response } from "express";
import fetch from "node-fetch";

export const fetchJSON = async (url: string) =>
    await (await fetch(url)).json();

export const sendJsonResponse = async (res: Response, url: string, error?: string) => {
    try {
        res.json(await fetchJSON(url));
    } catch {
        res
            .status(500)
            .json({ error: error ? error : "Couldn't fetch data" });
    }
};
