// ========================================
// Import sql.js
// ========================================
const initSqlJs = require("sql.js");
const fs = require("fs");


// Database file location
const DB_FILE = "./database/lomi.db";


// ========================================
// Initialize database
// ========================================
async function initializeDatabase() {

    const SQL = await initSqlJs();

    let db;


    if (fs.existsSync(DB_FILE)) {

        const buffer = fs.readFileSync(DB_FILE);
        db = new SQL.Database(buffer);

    } else {

        db = new SQL.Database();

    }

db.run(`
    CREATE TABLE IF NOT EXISTS visitors (
        id INTEGER PRIMARY KEY,
        count INTEGER DEFAULT 0
    )
`);

const check = db.exec(
    "SELECT * FROM visitors"
);

if (!check[0] || check[0].values.length === 0) {

    db.run(
        "INSERT INTO visitors (count) VALUES (0)"
    );

}


    db.run(`
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

            collected_date TEXT,

            score INTEGER,

            quality TEXT

        );
    `);


    saveDatabase(db);

    console.log("✅ Database initialized.");

    return db;

}



// ========================================
// Save database
// ========================================
function saveDatabase(db) {

    const data = db.export();

    fs.writeFileSync(
        DB_FILE,
        Buffer.from(data)
    );

}



// ========================================
// Save one job
// ========================================
function saveJob(db, job) {


    job.title = job.title || "";
    job.company = job.company || "";
    job.location = job.location || "";
    job.description = job.description || "";
    job.category = job.category || "";
    job.salary = job.salary || "";
    job.experience = job.experience || "";
    job.source = job.source || "";
    job.apply_link = job.apply_link || "";
    job.posted_date = job.posted_date || "";
    job.score = job.score || 0;
    job.quality = job.quality || "";


    const today =
        new Date()
        .toISOString()
        .slice(0, 10);


    job.collected_date = today;



    // Check existing job
    const existing = db.exec(
        "SELECT id FROM jobs WHERE apply_link = ?",
        [job.apply_link]
    );


    if (
        existing[0] &&
        existing[0].values.length > 0
    ) {

        return existing[0].values[0][0];

    }



    // Insert new job
    db.run(

        `
        INSERT INTO jobs
        (
            title,
            company,
            location,
            description,
            category,
            salary,
            experience,
            source,
            apply_link,
            posted_date,
            collected_date,
            score,
            quality
        )

        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)

        `,

        [

            job.title,
            job.company,
            job.location,
            job.description,
            job.category,
            job.salary,
            job.experience,
            job.source,
            job.apply_link,
            job.posted_date,
            job.collected_date,
            job.score,
            job.quality

        ]

    );


    saveDatabase(db);



   const result = db.exec(
    "SELECT id FROM jobs ORDER BY id DESC LIMIT 1"
);

return result[0].values[0][0];
}

// ========================================
// Delete jobs older than 7 days
// ========================================
function deleteExpiredJobs(db) {


    const date =
    new Date();


    date.setDate(
        date.getDate() - 7
    );


    const cutoff =
    date.toISOString()
    .slice(0,10);



    db.run(
        "DELETE FROM jobs WHERE collected_date < ?",
        [cutoff]
    );


    saveDatabase(db);


    console.log("🗑️ Old jobs deleted.");

}



// ========================================
// Get all jobs
// ========================================
function getJobs(db) {


    return db.exec(
        "SELECT * FROM jobs ORDER BY id DESC"
    );

}



// ========================================
// Export functions
// ========================================
module.exports = {

    initializeDatabase,

    saveJob,

    getJobs,

    deleteExpiredJobs

};
