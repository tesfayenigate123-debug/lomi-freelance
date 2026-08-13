const cron = require('node-cron');
const { pool } = require('../database/db');

async function saveScrapedJobs(jobs) {
    if (!Array.isArray(jobs) || jobs.length === 0) return;

    const client = await pool.connect();
    try {
        for (const job of jobs) {
            await client.query(
                `INSERT INTO jobs (title, company, location, description, category, salary, experience, source, apply_link, posted_date, collected_date)
                 VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)
                 ON CONFLICT (apply_link) DO NOTHING`,
                [
                    job.title || 'Untitled',
                    job.company || 'N/A',
                    job.location || 'Remote',
                    job.description || '',
                    job.category || 'General',
                    job.salary || 'N/A',
                    job.experience || 'Entry Level',
                    job.source || 'Arbeitnow',
                    job.apply_link,
                    job.posted_date || new Date().toISOString(),
                    new Date().toISOString()
                ]
            );
        }
        console.log(`✅ Saved ${jobs.length} jobs to database.`);
    } catch (error) {
        console.error("❌ Error saving scraped jobs:", error.message);
    } finally {
        client.release();
    }
}

function startScheduler() {
    console.log("⏰ Daily cron job scheduled for 12:10 PM EAT.");

    cron.schedule('31 08 * * *', async () => {
        console.log("⏰ Running scheduled daily job scrape...");
        try {
            // Call your scraper function here and pass results to saveScrapedJobs
        } catch (error) {
            console.error("Scheduler execution failed:", error.message);
        }
    });
}

module.exports = { startScheduler, saveScrapedJobs };
