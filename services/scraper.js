// services/scraper.js (or wherever your fetchJobs resides)
const fetchRemotiveJobs = require("./sources/remotive");
const fetchHimalayasJobs = require("./sources/himalayas");
const fetchJobicyJobs = require("./sources/jobicy");

const scoreJob = require("./jobScorer");
const analyzeJob = require("./jobAnalyzer");

async function fetchJobs() {
    console.log("🔍 Scraping remote jobs across sources...");

    const results = await Promise.allSettled([
        fetchRemotiveJobs(),
        fetchHimalayasJobs(),
        fetchJobicyJobs()
    ]);

    const remotive = results[0].status === "fulfilled" ? results[0].value : [];
    const himalayas = results[1].status === "fulfilled" ? results[1].value : [];
    const jobicy = results[2].status === "fulfilled" ? results[2].value : [];

    let allJobs = [...remotive, ...himalayas, ...jobicy];

    // Remove duplicates from raw scrape list
    allJobs = allJobs.filter(
        (job, index, self) =>
            job.apply_link &&
            index === self.findIndex((j) => j.apply_link === job.apply_link)
    );

    // Score and analyze
    allJobs = allJobs.map((job) => {
        const result = scoreJob(job);
        job.score = result.score;
        job.quality = result.quality;
        job.category = result.category;

        const analysis = analyzeJob(job);
        job.salary = analysis.salary || job.salary || "N/A";
        job.experience = analysis.experience || job.experience || "Entry / Mid";

        return job;
    });

    // Keep high quality jobs (score > 35 according to Lomi quality rules)
    allJobs = allJobs.filter((job) => job.score > 35);

    // Sort by highest score first
    allJobs.sort((a, b) => b.score - a.score);

    console.log(`✅ Total qualified Lomi jobs: ${allJobs.length}. Returning top 15.`);

    // Strictly limit output to top 15 jobs
    return allJobs.slice(0, 15);
}

module.exports = fetchJobs;
