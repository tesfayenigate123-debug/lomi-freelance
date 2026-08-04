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


        // Save jobs and send to Telegram slowly
        for (const job of jobs) {


            const jobId =
            saveJob(db, job);


            console.log(
                "Saved job ID:",
                jobId
            );


            await sendJobToTelegram(
                job,
                jobId
            );


            // Telegram rate limit protection
            await new Promise(resolve =>
                setTimeout(resolve, 1500)
            );

        }


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


    // Run once when server starts
    collectJobs(db).catch(error => {

        console.log(
            "Startup collection error:",
            error.message
        );

    });


    // Then run every day at 6:00 AM
   cron.schedule("0 9 * * *", () => {

    collectJobs(db);

}, {
    timezone: "Africa/Addis_Ababa"
});

    console.log(
        "✅ Daily job scheduler started"
    );

};
