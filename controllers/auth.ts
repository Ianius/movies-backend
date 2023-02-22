import { NextFunction, Request, Response } from 'express';
import { Config } from '../utils/config';

import jwt from 'jsonwebtoken';
import connection from '../database/connection';
import bcrypt from 'bcrypt';
import { OkPacket, RowDataPacket } from 'mysql2';

interface AuthTokenData {
    id: number;
    username: string;
}

export interface AuthRequest extends Request {
    body: { username: string, password: string };
}

export interface AuthResponseLocals {
    user: AuthTokenData;
}

interface User extends RowDataPacket {
    id: number;
}

export const authenticate = (req: Request, res: Response, next: NextFunction) => {
    const auth = req.headers['authorization'];

    if (!(auth && auth.startsWith("Bearer"))) {
        return res
            .status(401)
            .json({ error: true, status_message: "Access denied" });
    }

    const token = auth.split(" ")[1];

    jwt.verify(token, Config.JWT_KEY!, (err, user) => {
        if (err) {
            return res
                .status(401)
                .json({ error: true, status_message: "Invalid token" });
        }

        res.locals.user = user!;

        next();
    });
};

const createToken = (data: AuthTokenData) =>
    jwt.sign(data, Config.JWT_KEY!, { expiresIn: "24h" });

export const register = async (req: AuthRequest, res: Response) => {
    const { username, password } = req.body;

    if (!(username && password)) {
        return res
            .status(400)
            .json({ error: true, status_message: "No username or password provided" });
    }
    
    const [users] = await connection.query<User[]>("SELECT * FROM users WHERE username = ?", [username]);

    if (users.length > 0) {
        return res
            .status(400)
            .json({ error: true, status_message: "User already exists" });
    }

    const hash = await bcrypt.hash(password, 8);

    const [result] = await connection.query<OkPacket>("INSERT INTO users(username, password) VALUES (?, ?)", [username, hash]);

    const id = result.insertId;
    const token = createToken({ username, id });

    await connection.query("INSERT INTO lists (name, user_id) VALUES (?, ?), (?, ?)", ["Favorites", id, "Watchlist", id]);

    res
        .status(200)
        .json({ token, username });
};

export const login = async (req: AuthRequest, res: Response) => {
    const { username, password } = req.body;

    if (!(username && password)) {
        return res
            .status(400)
            .json({ error: true, status_message: "No username or password provided" });
    }

    const [users] = await connection.query<User[]>("SELECT * FROM users WHERE username = ?", [username]);

    if (users.length === 0) {
        return res
            .status(400)
            .json({ error: true, status_message: "User doesn't exist" });
    }

    const user = users[0];

    if (await bcrypt.compare(password, user.password)) {
        const token = createToken({ username: user.username, id: user.id });

        return res
            .status(200)
            .json({ token, username });
    }

    res
        .status(400)
        .json({ error: true, status_message: "Incorrect username or password" });
};
