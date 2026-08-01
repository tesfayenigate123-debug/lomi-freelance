// ========================================
// Jobicy Source
// Structure: Function module
// ========================================

const axios = require("axios");


// ========================================
// Fetch jobs from Jobicy API
// ========================================

async function fetchJobicyJobs() {

    try {


        const response =
        await axios.get(
            "https://jobicy.com/api/v2/remote-jobs"
        );


        const jobs =
        response.data.jobs || [];



        return jobs.map(job => {


            return {

                title:
                job.jobTitle || "",


                company:
                job.companyName || "",


                location:
                job.jobGeo || "Remote",


                description:
                job.jobDescription || "",


                category:
                "",


                salary:
                job.annualSalaryMin
                ?
                `${job.annualSalaryMin}-${job.annualSalaryMax}`
                :
                "",


                experience:
                "",


                source:
                "Jobicy",


                apply_link:
                job.url || ""

            };


        });


    }

    catch(error) {


        console.log(
            "Jobicy error:",
            error.message
        );


        return [];

    }

}


module.exports = fetchJobicyJobs;
