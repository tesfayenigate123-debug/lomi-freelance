const fetchJobicyJobs =
require("./services/sources/jobicy");


fetchJobicyJobs()

.then(jobs => {

    console.log(
        "Jobs found:",
        jobs.length
    );


    console.log(
        jobs[0]
    );

});
