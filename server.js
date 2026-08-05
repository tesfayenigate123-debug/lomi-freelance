// ========================================
// Module imports
// ========================================
const express = require("express");
const { initializeDatabase, getJobs } = require("./database/db");
const fs = require("fs");

const DB_FILE = "./database/lomi.db";

// In-memory persistent visitor counter variable
let visitorCount = 1;

// Helper function to save in-memory sql.js state to disk
function persistDatabase(db) {
    if (db) {
        try {
            // Update database count column right before disk export
            db.run("UPDATE visitors SET count = ?", [visitorCount]);
            const data = db.export();
            fs.writeFileSync(DB_FILE, Buffer.from(data));
        } catch (err) {
            console.error("❌ Failed to persist database disk image:", err.message);
        }
    }
}

// Helper to convert raw sql.js query results into key-value objects
function queryToObjects(db, query, params = []) {
    const res = db.exec(query, params);
    if (!res[0]) return [];

    const columns = res[0].columns;
    const values = res[0].values;

    return values.map((row) => {
        const item = {};
        columns.forEach((col, index) => {
            item[col] = row[index];
        });
        return item;
    });
}

// ========================================
// Create Express application
// ========================================
const app = express();

// ========================================
// Port number (Railway / Heroku compatible)
// ========================================
const PORT = process.env.PORT || 3000;

// ========================================
// Middleware
// ========================================
app.use(express.json());

// Enable CORS
app.use((req, res, next) => {
    res.header("Access-Control-Allow-Origin", "*");
    res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
    next();
});

// Global database reference
let db;

// ========================================
// GLOBAL VISITOR COUNTER MIDDLEWARE
// Increments every time a user visits '/' or '/job/:id'
// ========================================
app.use((req, res, next) => {
    const isPageVisit = req.path === "/" || req.path.startsWith("/job/");
    
    if (isPageVisit) {
        visitorCount += 1;
        persistDatabase(db);
    }
    next();
});

app.use(express.static("client"));

// ========================================
// Home route
// ========================================
app.get("/", (req, res) => {
    res.sendFile(__dirname + "/client/index.html");
});

// ========================================
// Visitor count API
// ========================================
app.get("/visitors", (req, res) => {
    res.json({ visitors: visitorCount });
});

// ========================================
// Get all freelance jobs
// ========================================
const handleGetJobs = (req, res) => {
    try {
        const jobs = getJobs(db);
        res.json(jobs);
    } catch (error) {
        console.error("❌ Job retrieval error:", error.message);
        res.status(500).json({ error: "Failed to retrieve jobs" });
    }
};

app.get("/jobs", handleGetJobs);
app.get("/api/jobs", handleGetJobs);

// ========================================
// Add a new job manually
// ========================================
app.post("/jobs", (req, res) => {
    const { title, company, location, source, apply_link, posted_date, description, salary, experience, category } = req.body;

    if (!title || !apply_link) {
        return res.status(400).json({ error: "Title and apply_link are required fields" });
    }

    try {
        db.run(
            `
            INSERT INTO jobs (title, company, location, description, category, salary, experience, source, apply_link, posted_date, collected_date)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
            `,
            [
                title,
                company || "",
                location || "Remote",
                description || "",
                category || "General",
                salary || "N/A",
                experience || "Entry Level",
                source || "Manual",
                apply_link,
                posted_date || new Date().toISOString().slice(0, 10),
                new Date().toISOString().slice(0, 10)
            ]
        );

        persistDatabase(db);
        res.json({ message: "Job added successfully" });
    } catch (error) {
        res.status(500).json({ error: "Failed to insert job. Link might already exist." });
    }
});

// ========================================
// Single Lomi job landing page
// ========================================
app.get("/job/:id", (req, res) => {
    const id = Number(req.params.id);
    const results = queryToObjects(db, "SELECT * FROM jobs WHERE id = ?", [id]);

    if (results.length === 0) {
        return res.status(404).send(`
            <!DOCTYPE html>
            <html>
            <head><title>Job Not Found - Lomi</title></head>
            <body style="font-family: Arial, sans-serif; text-align: center; padding: 50px;">
                <h2>⚠️ Job Posting Not Found or Expired</h2>
                <a href="/">Back to All Jobs</a>
            </body>
            </html>
        `);
    }

    const job = results[0];

    res.send(`
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>${job.title} - Lomi Freelance</title>
    <style>
        body {
            font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
            background-color: #f9fafb;
            color: #111827;
            margin: 0;
            padding: 40px 20px;
            display: flex;
            justify-content: center;
        }
        .job-card {
            background: #ffffff;
            width: 100%;
            max-width: 680px;
            border: 1px solid #e5e7eb;
            padding: 32px;
            border-radius: 12px;
            box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.05);
        }
        .visitor-badge {
            font-size: 13px;
            color: #6b7280;
            margin-bottom: 16px;
        }
        h1 { margin-top: 0; font-size: 24px; color: #111827; }
        .meta-item { margin: 8px 0; font-size: 15px; color: #374151; }
        .description {
            margin-top: 20px;
            padding-top: 20px;
            border-top: 1px solid #f3f4f6;
            line-height: 1.6;
            white-space: pre-wrap;
        }
        .apply {
            display: inline-block;
            margin-top: 28px;
            padding: 14px 28px;
            background: #000000;
            color: #ffffff;
            text-decoration: none;
            font-weight: 600;
            border-radius: 8px;
            transition: background 0.2s ease;
        }
        .apply:hover { background: #1f2937; }
    </style>
</head>
<body>
    <div class="job-card">
        <div class="visitor-badge">👁️ Total Website Visits: ${visitorCount}</div>
        <h1>💼 ${job.title}</h1>
        ${job.company ? `<div class="meta-item">🏢 <strong>Company:</strong> ${job.company}</div>` : ""}
        ${job.location ? `<div class="meta-item">🌍 <strong>Location:</strong> ${job.location}</div>` : ""}
        ${job.category ? `<div class="meta-item">📂 <strong>Category:</strong> ${job.category}</div>` : ""}
        ${job.salary ? `<div class="meta-item">💰 <strong>Salary:</strong> ${job.salary}</div>` : ""}
        ${job.experience ? `<div class="meta-item">📈 <strong>Experience:</strong> ${job.experience}</div>` : ""}

        ${job.description ? `<div class="description"><strong>Description:</strong><br>${job.description}</div>` : ""}

        <a class="apply" href="${job.apply_link}" target="_blank" rel="noopener noreferrer">
            Apply Now ↗
        </a>
    </div>
</body>
</html>
`);
});

// ========================================
// Start server
// ========================================
async function startServer() {
    try {
        db = await initializeDatabase();
        
        // Restore initial count value from database state on startup
        try {
            const result = db.exec("SELECT count FROM visitors");
            if (result[0]?.values[0]?.[0]) {
                visitorCount = result[0].values[0][0];
            }
        } catch (e) {
            console.log("Using initial visitor count baseline.");
        }

        console.log("✅ Database initialized.");

        // Start scheduler cron worker
        require("./scheduler/dailyJobs")(db);

        app.listen(PORT, "0.0.0.0", () => {
            console.log(`🚀 Server running on port ${PORT}`);
        });
    } catch (error) {
        console.error("❌ Server startup error:", error.message);
        process.exit(1);
    }
}

startServer();
