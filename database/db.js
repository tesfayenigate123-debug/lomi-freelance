const { Pool } = require('pg');

const connectionString = process.env.DATABASE_URL || process.env.POSTGRES_URL;

if (!connectionString) {
    console.error("❌ CRITICAL ERROR: DATABASE_URL environment variable is missing!");
    process.exit(1);
}

const pool = new Pool({
    connectionString,
    ssl: connectionString.includes('railway.internal') 
        ? false 
        : { rejectUnauthorized: false }
});

async function initializeDatabase() {
    let client;
    try {
        client = await pool.connect();
        await client.query(`
            CREATE TABLE IF NOT EXISTS jobs (
                id SERIAL PRIMARY KEY,
                title VARCHAR(255) NOT NULL,
                company VARCHAR(255),
                location VARCHAR(255),
                description TEXT,
                category VARCHAR(255),
                salary VARCHAR(255),
                experience VARCHAR(255),
                source VARCHAR(255),
                apply_link VARCHAR(500) UNIQUE,
                posted_date VARCHAR(50),
                collected_date VARCHAR(50)
            );
        `);

        await client.query(`
            CREATE TABLE IF NOT EXISTS visitor_counts (
                id SERIAL PRIMARY KEY,
                page_path VARCHAR(255) UNIQUE DEFAULT '/',
                views INT DEFAULT 0,
                last_visited TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            );
        `);

        console.log("✅ Managed Cloud PostgreSQL initialized successfully.");
    } catch (error) {
        console.error("❌ PostgreSQL Connection Error:", error.message);
    } finally {
        if (client) client.release();
    }
}

module.exports = { pool, initializeDatabase };
