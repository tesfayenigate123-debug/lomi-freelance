const cron = require("node-cron");
const fetchJobs = require("../services/scraper");
const { saveJob } = require("../database/db");
const sendTelegramAlert = require("../services/telegram");

module.exports = function initScheduler(db) {
    // Schedule task to run every day at 12:00 PM
    cron.schedule("0 12 * * *", async () => {
        console.log("⏰ [12:00 PM] Starting scheduled job collection...");

        try {
            const jobs = await fetchJobs(db);
            let addedCount = 0;

            for (const job of jobs) {
                const insertedId = saveJob(db, job);
                if (insertedId) {
                    addedCount++;
                    await sendTelegramAlert(job, insertedId);
                }
            }

            console.log(`✅ Daily execution finished: ${addedCount} NEW jobs added.`);
        } catch (error) {
            console.error("❌ Scheduled collection error:", error.message);
        }
    });

    console.log("📅 Cron job scheduled for 12:00 PM daily.");
};
	
