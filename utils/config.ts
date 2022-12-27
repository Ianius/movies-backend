import dotenv from 'dotenv';
import { Logger } from './logger';

Logger.info("Config: ", dotenv.config().parsed);
Logger.info("Environment: ", process.env.NODE_ENV);

export const Config = {
    PORT: process.env.PORT,
    API_KEY: process.env.API_KEY,
    NODE_ENV: process.env.NODE_ENV
};
