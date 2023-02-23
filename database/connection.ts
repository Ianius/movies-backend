import { Config } from '../utils/config';
import mysql from 'mysql2/promise';

const connection = mysql.createPool({
    host:            Config.DB_HOST,
    user:            Config.DB_USER,
    password:        Config.DB_PWRD,
    database:        Config.DB_NAME,
    port:            Config.DB_PORT,
    connectionLimit: 10,
});

export default connection;
