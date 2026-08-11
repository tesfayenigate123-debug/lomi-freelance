const { Pool } = require('pg');

const connectionString = process.env.DATABASE_URL || process.env.POSTGRES_URL;

if (!connectionString) {
    throw new Error("DATABASE_URL is missing or empty in environment variables!");
}

const pool = new Pool({
    connectionString,
    ssl: connectionString.includes('railway.internal') 
        ? false 
        : { rejectUnauthorized: false }
});

async function initializeDatabase() {
    try {
        const client = await pool.connect();
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
        client.release();
        console.log("✅ PostgreSQL initialized successfully.");
    } catch (error) {
        console.error("❌ PostgreSQL Connection Error:", error);
    }
}

module.exports = { pool, initializeDatabase };
