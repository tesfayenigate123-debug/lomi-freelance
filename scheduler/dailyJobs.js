// ========================================
// Import node-cron
// ========================================
const cron = require("node-cron");

// ========================================
// Import database functions
// ========================================
const {
    saveJob,
    deleteExpiredJobs
} = require("../database/db");

// ========================================
// Import job collector
// ========================================
const fetchJobs = require("../services/scraper");

// ========================================
// Import Telegram sender
// ========================================
const sendJobToTelegram = require("../services/telegram");

// ========================================
// Function to collect jobs
// ========================================
async function collectJobs(db) {
    console.log("🚀 Starting daily job collection...");

    try {
        // 1. Clean up stale jobs older than 7 days first
        deleteExpiredJobs(db);

        // 2. Fetch jobs from scraper engine
        const jobs = await fetchJobs();
        console.log(`📥 Scraped ${jobs.length} total potential jobs.`);

        let newJobsCount = 0;

        // 3. Process jobs individually
        for (const job of jobs) {
            // saveJob should return the new Insert ID, or null/false if job already exists
            const jobId = saveJob(db, job);

            // Skip Telegram notification if job was already present in database
            if (!jobId) {
                continue;
            }

            console.log(`💾 Saved NEW job ID: ${jobId} - ${job.title}`);
            newJobsCount++;

            // Dispatch to Telegram channel
            await sendJobToTelegram(job, jobId);

            // 2-second delay between posts for Telegram API rate limit protection
            await new Promise((resolve) => setTimeout(resolve, 2000));
        }

        console.log(`✅ Daily execution finished: ${newJobsCount} NEW jobs added & posted to Telegram.`);

    } catch (error) {
        console.error("❌ Daily job collection error:", error.message);
    }
}

// ========================================
// Export scheduler
// ========================================
module.exports = function(db) {

    // Run once on server startup
    collectJobs(db).catch((error) => {
        console.error("❌ Startup collection error:", error.message);
    });

    // Schedule daily run at 9:00 AM (Africa/Addis_Ababa)
    cron.schedule("0 9 * * *", () => {
        collectJobs(db);
    }, {
        scheduled: true,
        timezone: "Africa/Addis_Ababa"
    });

    console.log("✅ Daily job scheduler initialized (Africa/Addis_Ababa time zone)");
};
