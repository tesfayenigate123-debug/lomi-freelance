const express = require("express");
const { initializeDatabase, saveJob, getJobs, pool } = require("./database/db");
const startScheduler = require("./scheduler/dailyJobs");

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());

app.use((req, res, next) => {
    res.header("Access-Control-Allow-Origin", "*");
    res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
    next();
});

// Visitor tracking
app.use(async (req, res, next) => {
    const isPageVisit = req.path === "/" || req.path.startsWith("/job/");
    if (isPageVisit) {
        try {
            await pool.query("UPDATE visitors SET count = count + 1 WHERE id = 1");
        } catch (err) {
            console.error("Visitor count error:", err.message);
        }
    }
    next();
});

app.use(express.static("client"));

app.get("/", (req, res) => {
    res.sendFile(__dirname + "/client/index.html");
});

app.get("/stats", async (req, res) => {
    try {
        const jobRes = await pool.query("SELECT COUNT(*) FROM jobs");
        const visRes = await pool.query("SELECT count FROM visitors WHERE id = 1");
        
        const totalJobs = parseInt(jobRes.rows[0]?.count || 0, 10);
        const visitors = parseInt(visRes.rows[0]?.count || 1, 10);

        res.json({ totalJobs, visitors });
    } catch (err) {
        res.json({ totalJobs: 0, visitors: 1 });
    }
});

app.get("/jobs", async (req, res) => {
    try {
        const jobs = await getJobs();
        res.json(jobs);
    } catch (error) {
        res.status(500).json({ error: "Failed to retrieve jobs" });
    }
});

app.get("/job/:id", async (req, res) => {
    const id = Number(req.params.id);
    try {
        const jobs = await getJobs();
        const job = jobs.find((j) => j.id === id);

        if (!job) {
            return res.status(404).send("<h2>Job Not Found</h2><a href='/'>Back to Jobs</a>");
        }

        const visRes = await pool.query("SELECT count FROM visitors WHERE id = 1");
        const visitorCount = visRes.rows[0]?.count || 1;

        res.send(`
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>${job.title} - Lomi Freelance</title>
    <style>
        body { font-family: sans-serif; background: #f9fafb; padding: 40px 20px; display: flex; justify-content: center; }
        .job-card { background: #fff; width: 100%; max-width: 680px; border: 1px solid #e5e7eb; padding: 32px; border-radius: 12px; }
        .badge { font-size: 13px; color: #6b7280; margin-bottom: 16px; }
        .apply { display: inline-block; margin-top: 28px; padding: 14px 28px; background: #000; color: #fff; text-decoration: none; border-radius: 8px; font-weight: 600; }
    </style>
</head>
<body>
    <div class="job-card">
        <div class="badge">👁️ Total Visits: ${visitorCount}</div>
        <h1>💼 ${job.title}</h1>
        <p>🏢 <strong>Company:</strong> ${job.company || "N/A"}</p>
        <p>📂 <strong>Category:</strong> ${job.category || "General"}</p>
        <p>💰 <strong>Salary:</strong> ${job.salary || "N/A"}</p>
        <div style="margin-top:20px; line-height:1.6; white-space: pre-wrap;">${job.description || ""}</div>
        <a class="apply" href="${job.apply_link}" target="_blank">Apply Now ↗</a>
    </div>
</body>
</html>
        `);
    } catch (err) {
        res.status(500).send("Error rendering job details");
    }
});

async function startServer() {
    try {
        await initializeDatabase();
        startScheduler();

        app.listen(PORT, "0.0.0.0", () => {
            console.log(`🚀 Server running on port ${PORT}`);
        });
    } catch (error) {
        console.error("❌ Startup error:", error.message);
        process.exit(1);
    }
}

startServer();
