// ========================================
// Import job sources
// ========================================

const fetchRemotiveJobs =
require("./sources/remotive");

const fetchHimalayasJobs =
require("./sources/himalayas");

const fetchJobicyJobs =
require("./sources/jobicy");

// ========================================
// Import Lomi tools
// ========================================

const scoreJob =
require("./jobScorer");

const analyzeJob =
require("./jobAnalyzer");


// ========================================
// Main scraper
// ========================================

async function fetchJobs() {

    const remotive =
    await fetchRemotiveJobs();

    const himalayas =
    await fetchHimalayasJobs();

   const jobicy =
await fetchJobicyJobs();

    // Combine all sources
    let allJobs = [

        ...remotive,

        ...himalayas,

       ...jobicy
    ];


    // ========================================
    // Remove duplicate jobs
    // ========================================

    allJobs =
    allJobs.filter(

        (job, index, self) =>

        index ===

        self.findIndex(

            j =>

            j.apply_link === job.apply_link

        )

    );


    // ========================================
    // Analyze and score jobs
    // ========================================

    allJobs =
    allJobs.map(job => {

        // Score the job
        const result =
        scoreJob(job);

        job.score =
        result.score;

        job.quality =
        result.quality;

        job.category =
        result.category;


        // Analyze salary and experience
        const analysis =
        analyzeJob(job);

        job.salary =
        analysis.salary || job.salary;

        job.experience =
        analysis.experience || job.experience;


        return job;

    });


    // ========================================
    // Keep only high-quality jobs
    // ========================================

    allJobs =
    allJobs.filter(

        job =>

        job.score > 65

    );


    // ========================================
    // Best jobs first
    // ========================================

    allJobs.sort(

        (a, b) =>

        b.score - a.score

    );


    console.log(

        "Final Lomi jobs:",

        allJobs.length

    );


    // Return only the best 15 jobs
    return allJobs.slice(0, 15);

}


module.exports = fetchJobs;
