const fetchRemotiveJobs = require("./sources/remotive");
const fetchHimalayasJobs = require("./sources/himalayas");
const fetchJobicyJobs = require("./sources/jobicy");

const scoreJob = require("./jobScorer");
const analyzeJob = require("./jobAnalyzer");

async function fetchJobs(db) {
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

    // 1. Remove raw scrape duplicate links
    allJobs = allJobs.filter(
        (job, index, self) =>
            job.apply_link &&
            index === self.findIndex((j) => j.apply_link === job.apply_link)
    );

    // 2. Filter out jobs that ALREADY exist in your database
    if (db) {
        allJobs = allJobs.filter((job) => {
            const check = db.exec("SELECT id FROM jobs WHERE apply_link = ?", [job.apply_link]);
            return !check[0] || check[0].values.length === 0;
        });
    }

    // 3. Score and analyze remaining UNSEEN jobs
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

    // 4. Sort by highest quality score
    allJobs.sort((a, b) => b.score - a.score);

    // Primary Tier: Strict quality (Score > 35)
    let qualifiedJobs = allJobs.filter((job) => job.score > 35);

    // Fallback Tier: If high-quality jobs are under 5, lower threshold (Score > 20) to ensure at least 5 jobs
    if (qualifiedJobs.length < 5) {
        console.log(`⚠️ Only ${qualifiedJobs.length} top-tier new jobs found. Applying fallback threshold to meet minimum of 5...`);
        qualifiedJobs = allJobs.filter((job) => job.score > 20);
    }

    // Return between 5 and 15 strictly NEW jobs
    const finalSelection = qualifiedJobs.slice(0, 15);
    console.log(`✅ Selected ${finalSelection.length} new jobs for posting.`);
    
    return finalSelection;
}

module.exports = fetchJobs;
