// ========================================
// Import axios
// Structure: Module import
// ========================================
const axios = require("axios");


// ========================================
// Fetch jobs from RemoteOK
// Structure: Async function
// ========================================
async function fetchRemoteOKJobs() {

    try {

        // Request jobs from RemoteOK public API
        const response = await axios.get(
            "https://remoteok.com/api"
        );


        // Remove API information object
        const jobs = response.data.slice(1);


        // Convert to Lomi format
        return jobs.map(job => ({

            title: job.position,

            company: job.company,

            location: "Remote Worldwide",

            source: "RemoteOK",

            apply_link: job.url,

            posted_date: new Date().toISOString()

        }));


    } catch (error) {


        console.log(
            "RemoteOK error:",
            error.message
        );


        return [];

    }

}


// ========================================
// Export function
// ========================================
module.exports = fetchRemoteOKJobs;
