/**
 * PostgreSQL Database Connection Preparation
 * To be activated when Sandbox Simulation is disabled.
 */

// const { Pool } = require('pg');

const dbConfig = {
    user: process.env.DB_USER || 'klifox_admin',
    host: process.env.DB_HOST || 'localhost',
    database: process.env.DB_NAME || 'klifox_pilot_db',
    password: process.env.DB_PASSWORD || 'secret',
    port: process.env.DB_PORT || 5432,
    max: 20, // Connection pool max
    idleTimeoutMillis: 30000
};

// const pool = new Pool(dbConfig);

const migrateData = async () => {
    // 1. Export in-memory objects (App.Database.Users) to SQL schema
    // 2. Map existing simulated Craftsmen into "users" table with role "craftsman"
    console.log('[MIGRATION] Local Storage to PostgreSQL mapping planned.');
};

module.exports = {
    config: dbConfig,
    migrateData,
    // query: (text, params) => pool.query(text, params)
};
