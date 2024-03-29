import dotenv from 'dotenv';
import { Logger } from './logger';

Logger.info("Config: ", dotenv.config().parsed);
Logger.info("Environment: ", process.env.NODE_ENV);

export const Config = {
    PORT: process.env.PORT,
    API_KEY: process.env.API_KEY,
    NODE_ENV: process.env.NODE_ENV,
    DEV_ORIGIN: process.env.DEV_ORIGIN,
    PROD_ORIGIN: process.env.PROD_ORIGIN,
    JWT_KEY: process.env.JWT_KEY,
    DB_USER: process.env.DB_USER,
    DB_PWRD: process.env.DB_PWRD,
    DB_NAME: process.env.DB_NAME,
    DB_HOST: process.env.DB_HOST,
    DB_PORT: parseInt(process.env.DB_PORT!)
};
