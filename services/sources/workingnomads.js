// ========================================
// Import RSS parser
// Structure: Module import
// ========================================
const Parser = require("rss-parser");


// Create parser object
const parser = new Parser();


// ========================================
// Fetch jobs from Working Nomads RSS
// Structure: Async function
// ========================================
async function fetchWorkingNomadsJobs() {

    try {

        // Read public RSS feed
        const feed = await parser.parseURL(
            "https://www.workingnomads.com/jobs.rss"
        );


        // Convert RSS items to Lomi format
        const jobs = feed.items.map(item => ({

            title: item.title,

            company: "Working Nomads",

            location: "Remote Worldwide",

            source: "Working Nomads",

            apply_link: item.link,

            posted_date: item.pubDate ||
                new Date().toISOString()

        }));


        return jobs;


    } catch (error) {


        console.log(
            "Working Nomads error:",
            error.message
        );


        return [];

    }

}


// ========================================
// Export function
// ========================================
module.exports = fetchWorkingNomadsJobs;
