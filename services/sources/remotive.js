
// ========================================
// Import axios
// Structure: Module import
// ========================================
const axios = require("axios");


// ========================================
// Fetch jobs from Remotive public API
// Structure: Async function
// ========================================
async function fetchRemotiveJobs() {

    try {

        const response = await axios.get(
            "https://remotive.com/api/remote-jobs"
        );


        const jobs = response.data.jobs;


        return jobs.map(job => ({

            title: job.title,

            company: job.company_name,

            location: "Remote Worldwide",

            source: "Remotive",

            apply_link: job.url,

            posted_date: job.publication_date

        }));


    } catch (error) {

        console.log(
            "Remotive error:",
            error.message
        );


        return [];

    }

}


// ========================================
// Export function
// ========================================
module.exports = fetchRemotiveJobs;
