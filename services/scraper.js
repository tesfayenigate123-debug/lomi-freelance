// ========================================
// Import job sources
// ========================================

const fetchRemotiveJobs = require("./sources/remotive");
const fetchHimalayasJobs = require("./sources/himalayas");
const fetchJobicyJobs = require("./sources/jobicy");

// ========================================
// Import Lomi tools
// ========================================

const scoreJob = require("./jobScorer");
const analyzeJob = require("./jobAnalyzer");

// ========================================
// Main scraper
// ========================================

async function fetchJobs() {
    console.log("🔍 Scraping remote jobs across all sources...");

    // Fetch from all sources concurrently without throwing on single failure
    const results = await Promise.allSettled([
        fetchRemotiveJobs(),
        fetchHimalayasJobs(),
        fetchJobicyJobs()
    ]);

    const remotive = results[0].status === "fulfilled" ? results[0].value : [];
    const himalayas = results[1].status === "fulfilled" ? results[1].value : [];
    const jobicy = results[2].status === "fulfilled" ? results[2].value : [];

    console.log(`📊 Fetched Raw Jobs - Remotive: ${remotive.length}, Himalayas: ${himalayas.length}, Jobicy: ${jobicy.length}`);

    // Combine all sources
    let allJobs = [
        ...remotive,
        ...himalayas,
        ...jobicy
    ];

    // ========================================
    // Remove duplicate jobs
    // ========================================

    allJobs = allJobs.filter(
        (job, index, self) =>
            job.apply_link &&
            index === self.findIndex((j) => j.apply_link === job.apply_link)
    );

    // ========================================
    // Analyze and score jobs
    // ========================================

    allJobs = allJobs.map((job) => {
        // Score the job
        const result = scoreJob(job);
        job.score = result.score;
        job.quality = result.quality;
        job.category = result.category;

        // Analyze salary and experience
        const analysis = analyzeJob(job);
        job.salary = analysis.salary || job.salary || "N/A";
        job.experience = analysis.experience || job.experience || "Entry / Junior";

        return job;
    });

    // ========================================
    // Keep qualifying jobs (Lowered threshold from 40 to 20)
    // ========================================

    allJobs = allJobs.filter((job) => job.score >= 20);

    // ========================================
    // Best jobs first
    // ========================================

    allJobs.sort((a, b) => b.score - a.score);

    console.log(`✅ Final Lomi jobs available: ${allJobs.length}`);

    // Return all qualified jobs (or capped at 60 to prevent flooding)
    return allJobs.slice(0, 60);
}

module.exports = fetchJobs;
