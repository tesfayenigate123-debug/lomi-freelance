const initSqlJs = require("sql.js");
const fs = require("fs");
const path = require("path");

const dbPath = path.join(__dirname, "lomi.db");

async function initializeDatabase() {
    const SQL = await initSqlJs();
    let dbInstance;

    if (fs.existsSync(dbPath)) {
        const fileBuffer = fs.readFileSync(dbPath);
        dbInstance = new SQL.Database(fileBuffer);
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
    console.log("✅ Pure JS SQLite (sql.js) Database loaded successfully.");
    return dbInstance;
}

function saveToDisk(db) {
    if (!db) return;
    try {
        const data = db.export();
        const buffer = Buffer.from(data);
        fs.writeFileSync(dbPath, buffer);
    } catch (err) {
        console.error("❌ Database disk save failed:", err.message);
    }
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
        saveToDisk(db);
        return newId;
    } catch (error) {
        return null;
    }
}

function getJobs(db) {
    if (!db) return [];
    try {
        const res = db.exec("SELECT * FROM jobs ORDER BY id DESC");
        if (!res.length) return [];
        const columns = res[0].columns;
        return res[0].values.map((row) => {
            const obj = {};
            columns.forEach((col, idx) => {
                obj[col] = row[idx];
            });
            return obj;
        });
    } catch (err) {
        return [];
    }
}

module.exports = { initializeDatabase, saveJob, getJobs, saveToDisk };
