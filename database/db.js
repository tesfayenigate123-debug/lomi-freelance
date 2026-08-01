// ========================================
// Import sql.js
// Structure: Module import
// ========================================
const initSqlJs = require("sql.js");
const fs = require("fs");


// Database file location
const DB_FILE = "./database/lomi.db";



// ========================================
// Initialize database
// Structure: Async function
// ========================================
async function initializeDatabase() {


    const SQL = await initSqlJs();

    let db;


    // Check if database exists
    if (fs.existsSync(DB_FILE)) {


        const buffer = fs.readFileSync(DB_FILE);

        db = new SQL.Database(buffer);


    } else {


        db = new SQL.Database();


    }



    // Create jobs table

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
// Save database to file
// Structure: Function definition
// ========================================
function saveDatabase(db) {


    const data = db.export();


    fs.writeFileSync(

        DB_FILE,

        Buffer.from(data)

    );

}




// ========================================
// Delete old jobs
// Structure: Function definition
// ========================================
function clearJobs(db) {


    db.run(
        "DELETE FROM jobs"
    );


    saveDatabase(db);


    console.log("🗑️ Old jobs deleted.");

}





// ========================================
// Save one job
// Structure: Function definition
// ========================================
function saveJob(db, job) {



    // Prevent undefined values
    job.title =
    job.title || "";

    job.company =
    job.company || "";

    job.location =
    job.location || "";

    job.description =
    job.description || "";

    job.category =
    job.category || "";

    job.salary =
    job.salary || "";

    job.experience =
    job.experience || "";

    job.source =
    job.source || "";

    job.apply_link =
    job.apply_link || "";

    job.posted_date =
    job.posted_date || "";

    job.score =
    job.score || 0;

    job.quality =
    job.quality || "";

   const today =
new Date()
.toISOString()
.slice(0,10);

job.collected_date =
today;

    db.run(

        `
        INSERT OR IGNORE INTO jobs

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


// Return inserted job ID
const result = db.exec(
    "SELECT last_insert_rowid()"
);


return result[0].values[0][0];

}

function deleteExpiredJobs(db) {

    const sevenDaysAgo =
    new Date();

    sevenDaysAgo.setDate(
        sevenDaysAgo.getDate() - 7
    );

    const cutoff =
    sevenDaysAgo
    .toISOString()
    .slice(0,10);


    const stmt = db.prepare(
        "DELETE FROM jobs WHERE collected_date < ?"
    );

    stmt.bind([cutoff]);

    stmt.step();

    stmt.free();

    saveDatabase(db);

}

// ========================================
// Get all jobs
// Structure: Function definition
// ========================================
function getJobs(db) {


    const result = db.exec(

        "SELECT * FROM jobs ORDER BY id DESC"

    );


    return result;

}





// ========================================
// Export functions
// Structure: Module export
// ========================================
module.exports = {

    initializeDatabase,

    saveJob,

    getJobs,

    deleteExpiredJobs

};
