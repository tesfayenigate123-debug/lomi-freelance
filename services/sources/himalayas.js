
const axios = require("axios");


async function fetchHimalayasJobs() {

    try {

        const response = await axios.get(
            "https://himalayas.app/jobs/api"
        );


        const jobs = response.data.jobs || [];


        return jobs.map(job => ({

            title: job.title,

            company: job.company?.name || "",

            description: job.description || "",

            location: "Remote Worldwide",

            category: "",

            salary: job.salary || "",

            experience: "",

            source: "Himalayas",

            apply_link: job.applicationUrl,

            posted_date: new Date().toISOString()

        }));


    } catch(error) {

        console.log(
            "Himalayas error:",
            error.message
        );

        return [];

    }

}


module.exports = fetchHimalayasJobs;
