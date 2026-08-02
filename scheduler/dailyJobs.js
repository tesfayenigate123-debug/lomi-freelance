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
const fetchJobs =
require("../services/scraper");


// ========================================
// Import Telegram sender
// ========================================
const sendJobToTelegram =
require("../services/telegram");


// ========================================
// Function to collect jobs
// ========================================
async function collectJobs(db) {

    console.log(
        "Starting daily job collection..."
    );

    try {

        // Fetch jobs
        const jobs =
        await fetchJobs();

        console.log(
            `Collected ${jobs.length} jobs`
        );

        // Save jobs and send to Telegram
        jobs.forEach(job => {

            const jobId =
            saveJob(db, job);

            console.log(
                "Saved job ID:",
                jobId
            );

            sendJobToTelegram(
                job,
                jobId
            );

        });

        // Remove jobs older than 7 days
        deleteExpiredJobs(db);

        console.log(
            "Jobs saved and Telegram updated."
        );

    } catch (error) {

        console.log(
            "Daily job error:",
            error.message
        );

    }

}


// ========================================
// Export scheduler
// ========================================
module.exports = function(db) {

    // Run every day at 7:15 AM
    cron.schedule("* * * * *", () => {

        collectJobs(db);

    });

};
