const cron = require("node-cron");
const fetchJobs = require("../services/scraper");
const { saveJob } = require("../database/db");
const sendTelegramAlert = require("../services/telegram");

module.exports = function initScheduler(db) {
    // Scheduled for 12:10 PM East Africa Time
    cron.schedule(
        "10 12 * * *",
        async () => {
            console.log("⏰ [12:10 PM EAT] Starting scheduled job collection...");

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
        },
        {
            scheduled: true,
            timezone: "Africa/Addis_Ababa"
        }
    );

    console.log("📅 Cron job scheduled for 12:10 PM (Africa/Addis_Ababa) daily.");
};
