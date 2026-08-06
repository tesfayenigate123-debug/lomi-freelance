const Database = require("better-sqlite3");
const path = require("path");

const dbPath = path.join(__dirname, "lomi.db");
let db;

function initializeDatabase() {
    db = new Database(dbPath);
    db.pragma("journal_mode = WAL"); // High-performance concurrent access mode

    // Create jobs table
    db.exec(`
        CREATE TABLE IF NOT EXISTS jobs (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
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
        )
    `);

    // Create visitors table
    db.exec(`
        CREATE TABLE IF NOT EXISTS visitors (
            id INTEGER PRIMARY KEY CHECK (id = 1),
            count INTEGER DEFAULT 1
        )
    `);

    // Initialize visitor row if missing
    db.exec(`INSERT OR IGNORE INTO visitors (id, count) VALUES (1, 1)`);

    console.log("✅ Native SQLite Database connected successfully.");
    return db;
}

function saveJob(db, job) {
    try {
        const stmt = db.prepare(`
            INSERT INTO jobs (title, company, location, description, category, salary, experience, source, apply_link, posted_date, collected_date)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        `);

        const info = stmt.run(
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
        );

        return info.lastInsertRowid; // Auto-generated ID
    } catch (error) {
        // Suppress error if link already exists (UNIQUE constraint failure)
        return null;
    }
}

function getJobs(db) {
    const stmt = db.prepare("SELECT * FROM jobs ORDER BY id DESC");
    return stmt.all();
}

module.exports = { initializeDatabase, saveJob, getJobs };
