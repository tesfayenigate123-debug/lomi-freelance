const { Pool } = require("pg");

const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: process.env.DATABASE_URL ? { rejectUnauthorized: false } : false
});

async function initializeDatabase() {
    const client = await pool.connect();
    try {
        await client.query(`
            CREATE TABLE IF NOT EXISTS jobs (
                id SERIAL PRIMARY KEY,
                title TEXT NOT NULL,
                company TEXT,
                location TEXT,
                description TEXT,
                category TEXT,
                salary TEXT,
                experience TEXT,
                source TEXT,
                apply_link TEXT UNIQUE,
                posted_date TEXT,
                collected_date TEXT
            );
            CREATE TABLE IF NOT EXISTS visitors (
                id INT PRIMARY KEY DEFAULT 1,
                count INT DEFAULT 1
            );
            INSERT INTO visitors (id, count) VALUES (1, 1) ON CONFLICT (id) DO NOTHING;
        `);
        console.log("✅ Managed Cloud PostgreSQL initialized successfully.");
    } finally {
        client.release();
    }
}

async function saveJob(job) {
    const query = `
        INSERT INTO jobs (title, company, location, description, category, salary, experience, source, apply_link, posted_date, collected_date)
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)
        ON CONFLICT (apply_link) DO NOTHING
        RETURNING id;
    `;
    const values = [
        job.title,
        job.company || "",
        job.location || "Remote",
        job.description || "",
        job.category || "General",
        job.salary || "N/A",
        job.experience || "Entry Level",
        job.source || "Manual",
        job.apply_link,
        job.posted_date || new Date().toISOString().slice(0, 10),
        new Date().toISOString().slice(0, 10)
    ];

    try {
        const res = await pool.query(query, values);
        return res.rows[0] ? res.rows[0].id : null;
    } catch (err) {
        console.error("Save job error:", err.message);
        return null;
    }
}

async function getJobs() {
    try {
        const res = await pool.query("SELECT * FROM jobs ORDER BY id DESC");
        return res.rows;
    } catch (err) {
        console.error("Get jobs error:", err.message);
        return [];
    }
}

module.exports = { initializeDatabase, saveJob, getJobs, pool };
