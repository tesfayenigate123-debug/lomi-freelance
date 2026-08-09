const fetchRemotiveJobs = require("./sources/remotive");
const fetchHimalayasJobs = require("./sources/himalayas");
const fetchJobicyJobs = require("./sources/jobicy");
const fetchArbeitnowJobs = require("./sources/arbeitnow");

const scoreJob = require("./jobScorer");
const analyzeJob = require("./jobAnalyzer");
const { pool } = require("../database/db");

async function fetchJobs() {
    console.log("🔍 Scraping remote jobs across free sources...");

    const results = await Promise.allSettled([
        fetchRemotiveJobs(),
        fetchHimalayasJobs(),
        fetchJobicyJobs(),
        fetchArbeitnowJobs()
    ]);

    const remotive = results[0].status === "fulfilled" ? results[0].value : [];
    const himalayas = results[1].status === "fulfilled" ? results[1].value : [];
    const jobicy = results[2].status === "fulfilled" ? results[2].value : [];
    const arbeitnow = results[3].status === "fulfilled" ? results[3].value : [];

    let allJobs = [...remotive, ...himalayas, ...jobicy, ...arbeitnow];

    // 1. Remove duplicate links inside the current scrape batch
    allJobs = allJobs.filter(
        (job, index, self) =>
            job.apply_link &&
            index === self.findIndex((j) => j.apply_link === job.apply_link)
    );

    // 2. Remove jobs that ALREADY exist in PostgreSQL
    const existingLinksRes = await pool.query("SELECT apply_link FROM jobs");
    const existingLinks = new Set(existingLinksRes.rows.map((r) => r.apply_link));
    allJobs = allJobs.filter((job) => !existingLinks.has(job.apply_link));

    // 3. Score & analyze unseen jobs
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

    allJobs.sort((a, b) => b.score - a.score);

    let qualifiedJobs = allJobs.filter((job) => job.score > 35);
    if (qualifiedJobs.length < 5) {
        qualifiedJobs = allJobs.filter((job) => job.score > 20);
    }

    const finalSelection = qualifiedJobs.slice(0, 15);
    console.log(`✅ Selected ${finalSelection.length} NEW unique jobs for database insertion.`);

    return finalSelection;
}

module.exports = fetchJobs;
