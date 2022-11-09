import dotenv from 'dotenv';

console.log("ENV: ", dotenv.config().parsed);

export const Config = {
    PORT: process.env.PORT,
    API_KEY: process.env.API_KEY,
    NODE_ENV: process.env.NODE_ENV
};
