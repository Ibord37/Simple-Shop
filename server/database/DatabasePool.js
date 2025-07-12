// For manual queries executor if needed
const { Pool } = require('pg');

const config = require('../config/config.json');

const pool = new Pool({
    user: config.development.username,
    host: config.development.host,
    database: config.development.database,
    password: config.development.password,
    port: 5432
});

module.exports = pool;