const initSqlJs = require("sql.js");
const fs = require("fs");
const path = require("path");

const dbPath = path.join(__dirname, "lomi.db");
let dbInstance = null;

function saveToDisk(db) {
    if (!db) return;
    try {
        const data = db.export();
        const buffer = Buffer.from(data);
        fs.writeFileSync(dbPath, buffer);
    } catch (err) {
        console.error("❌ Disk save failed:", err.message);
    }
}

async function initializeDatabase() {
    const SQL = await initSqlJs();

    if (fs.existsSync(dbPath)) {
        try {
            const fileBuffer = fs.readFileSync(dbPath);
            dbInstance = new SQL.Database(fileBuffer);
            console.log("📂 Loaded existing lomi.db file from disk.");
        } catch (e) {
            dbInstance = new SQL.Database();
        }
    } else {
        dbInstance = new SQL.Database();
    }

    dbInstance.run(`
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
        );
        CREATE TABLE IF NOT EXISTS visitors (
            id INTEGER PRIMARY KEY CHECK (id = 1),
            count INTEGER DEFAULT 1
        );
        INSERT OR IGNORE INTO visitors (id, count) VALUES (1, 1);
    `);

    saveToDisk(dbInstance);
    console.log("✅ Pure JS SQLite (sql.js) initialized and verified.");
    return dbInstance;
}

function saveJob(db, job) {
    if (!db) return null;
    try {
        db.run(
            `INSERT INTO jobs (title, company, location, description, category, salary, experience, source, apply_link, posted_date, collected_date)
             VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
            [
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
            ]
        );

        const res = db.exec("SELECT last_insert_rowid() AS id");
        const newId = res[0]?.values[0]?.[0] || null;
        saveToDisk(db); // Save to disk immediately so new IDs are permanent
        return newId;
    } catch (error) {
        // Suppress duplicate URL insertion errors
        return null;
    }
}

function getJobs(db) {
    if (!db) return [];
    try {
        const res = db.exec("SELECT * FROM jobs ORDER BY id DESC");
        if (!res || !res.length) return [];
        const columns = res[0].columns;
        return res[0].values.map((row) => {
            const obj = {};
            columns.forEach((col, idx) => {
                obj[col] = row[idx];
            });
            return obj;
        });
    } catch (err) {
        console.error("Error running getJobs:", err.message);
        return [];
    }
}

module.exports = { initializeDatabase, saveJob, getJobs, saveToDisk };
