const cron = require("node-cron");
const fetchJobs = require("../services/scraper");
const { saveJob, pool } = require("../database/db");

function startScheduler() {
    // Schedule scraper for 12:10 PM EAT daily (09:10 UTC)
    cron.schedule("53 4 * * *", async () => {
        console.log("⏰ Running scheduled daily job scrape...");
        try {
            const newJobs = await fetchJobs();
            let addedCount = 0;

            for (const job of newJobs) {
                const insertedId = await saveJob(job);
                if (insertedId) addedCount++;
            }

            // Cleanup listings older than 30 days
            await pool.query("DELETE FROM jobs WHERE collected_date < CURRENT_DATE - INTERVAL '30 days'");
            console.log(`✅ Daily job run completed: ${addedCount} new jobs saved.`);
        } catch (error) {
            console.error("❌ Scheduler execution failed:", error.message);
        }
    });

    console.log("📅 Daily cron job scheduled for 12:10 PM EAT.");
}

module.exports = startScheduler;
