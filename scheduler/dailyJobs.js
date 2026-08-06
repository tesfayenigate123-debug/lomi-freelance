const cron = require("node-cron");
const fetchJobs = require("../services/scraper");
const { saveJob } = require("../database/db");
const sendTelegramAlert = require("../services/telegram");

module.exports = function initScheduler(db) {
    // Force cron to trigger daily at 12:10 PM East Africa Time
    cron.schedule(
        "10 12 * * *",
        async () => {
            console.log("⏰ [12:10 PM EAT] Starting scheduled job collection...");

            try {
                // 1. Scrape new jobs across all sources
                const jobs = await fetchJobs(db);
                let addedCount = 0;

                // 2. Save each job to SQLite and dispatch Telegram alerts
                for (const job of jobs) {
                    const insertedId = saveJob(db, job);
                    if (insertedId) {
                        addedCount++;
                        // Pass unique database primary key to Telegram
                        await sendTelegramAlert(job, insertedId);
                    }
                }

                console.log(`✅ Daily execution finished: ${addedCount} NEW jobs added.`);

                // 3. Purge jobs older than 30 days to keep database lightweight
                try {
                    const deleted = db.prepare(
                        "DELETE FROM jobs WHERE datetime(collected_date) < datetime('now', '-30 days')"
                    ).run();

                    if (deleted.changes > 0) {
                        console.log(`🧹 Auto-cleaned ${deleted.changes} old job listings from database.`);
                    }
                } catch (purgeError) {
                    console.error("❌ Database auto-cleanup error:", purgeError.message);
                }

            } catch (error) {
                console.error("❌ Scheduled collection error:", error.message);
            }
        },
        {
            scheduled: true,
            timezone: "Africa/Addis_Ababa"
        }
    );

    console.log("📅 Cron job successfully scheduled for 12:10 PM (Africa/Addis_Ababa) daily.");
};
