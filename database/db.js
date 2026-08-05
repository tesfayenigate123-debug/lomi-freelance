const initSqlJs = require("sql.js");
const fs = require("fs");
const path = require("path");

const DB_PATH = path.join(__dirname, "lomi.db");

// Helper to persist in-memory database to disk
function saveDatabase(db) {
    if (db) {
        const data = db.export();
        fs.writeFileSync(DB_PATH, Buffer.from(data));
    }
}

async function initializeDatabase() {
    const SQL = await initSqlJs();
    let db;

    if (fs.existsSync(DB_PATH)) {
        const filebuffer = fs.readFileSync(DB_PATH);
        db = new SQL.Database(filebuffer);
    } else {
        db = new SQL.Database();
    }

    // Create tables
    db.run(`
        CREATE TABLE IF NOT EXISTS jobs (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            title TEXT,
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
    `);

    db.run(`
        CREATE TABLE IF NOT EXISTS visitors (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            count INTEGER DEFAULT 0
        );
    `);

    // Initialize visitor row if missing
    const res = db.exec("SELECT count FROM visitors");
    if (!res[0] || res[0].values.length === 0) {
        db.run("INSERT INTO visitors (count) VALUES (1)");
    }

    saveDatabase(db);
    return db;
}

// ========================================
// Save single job (Checks for duplicates)
// ========================================
function saveJob(db, job) {
    const applyLink = job.apply_link || job.url;
    if (!applyLink) return null;

    // 1. Check if job already exists by URL
    const check = db.exec("SELECT id FROM jobs WHERE apply_link = ?", [applyLink]);
    if (check[0] && check[0].values.length > 0) {
        // Already exists in DB - Skip
        return null;
    }

    // 2. Insert new job
    const today = new Date().toISOString().slice(0, 10);
    db.run(
        `
        INSERT INTO jobs 
        (title, company, location, description, category, salary, experience, source, apply_link, posted_date, collected_date)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        `,
        [
            job.title || "Untitled",
            job.company || "Company",
            job.location || "Remote",
            job.description || "",
            job.category || "General",
            job.salary || "N/A",
            job.experience || "Not specified",
            job.source || "Scraper",
            applyLink,
            job.posted_date || today,
            today
        ]
    );

    saveDatabase(db);

    // Get newly inserted row ID
    const lastIdRes = db.exec("SELECT MAX(id) FROM jobs");
    return lastIdRes[0]?.values[0]?.[0] || null;
}

// ========================================
// Get all jobs for Website Homepage
// ========================================
function getJobs(db) {
    const res = db.exec("SELECT * FROM jobs ORDER BY id DESC LIMIT 50");
    if (!res[0]) return [];

    const columns = res[0].columns;
    return res[0].values.map((row) => {
        const item = {};
        columns.forEach((col, idx) => {
            item[col] = row[idx];
        });
        return item;
    });
}

// ========================================
// Delete jobs older than 7 days
// ========================================
function deleteExpiredJobs(db) {
    const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString().slice(0, 10);
    db.run("DELETE FROM jobs WHERE collected_date < ?", [sevenDaysAgo]);
    saveDatabase(db);
}

module.exports = {
    initializeDatabase,
    saveJob,
    getJobs,
    deleteExpiredJobs,
    saveDatabase
};
