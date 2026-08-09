const cron = require("node-cron");
const fetchJobs = require("../services/scraper");
const { saveJob, saveToDisk } = require("../database/db");
const sendTelegramAlert = require("../services/telegram");

module.exports = function startScheduler(db) {
    if (!db) {
        console.error("❌ Scheduler failed: Database instance is missing!");
        return;
    }

    // Schedule task daily at 12:10 PM East Africa Time
    cron.schedule(
        "29 03 * * *",
        async () => {
            console.log("⏰ [12:10 PM EAT] Starting scheduled job collection...");

            try {
                // 1. Scrape new jobs across sources
                const jobs = await fetchJobs(db);
                let addedCount = 0;

                // 2. Insert into SQLite and dispatch Telegram notifications
                for (const job of jobs) {
                    const insertedId = saveJob(db, job);
                    if (insertedId) {
                        addedCount++;
                        await sendTelegramAlert(job, insertedId);
                    }
                }

                saveToDisk(db);
                console.log(`✅ Daily execution finished: ${addedCount} NEW jobs added.`);

                // 3. Purge jobs older than 30 days
                try {
                    db.run("DELETE FROM jobs WHERE datetime(collected_date) < datetime('now', '-30 days')");
                    saveToDisk(db);
                    console.log("🧹 Auto-cleaned old job listings from database.");
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
