"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.closePool = exports.getPool = void 0;
const pg_1 = require("pg");
let pool = null;
const getPool = () => {
    if (!pool) {
        pool = new pg_1.Pool({
            user: process.env.DB_USER || 'postgres',
            host: process.env.DB_HOST || 'localhost',
            database: process.env.DB_NAME || 'vera_db',
            password: process.env.DB_PASSWORD || '',
            port: parseInt(process.env.DB_PORT || '5432'),
        });
    }
    return pool;
};
exports.getPool = getPool;
const closePool = async () => {
    if (pool) {
        await pool.end();
        pool = null;
    }
};
exports.closePool = closePool;
exports.default = exports.getPool;
//# sourceMappingURL=database.js.map