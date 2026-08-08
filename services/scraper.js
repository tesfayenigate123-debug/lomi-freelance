const fetchRemotiveJobs = require("./sources/remotive");
const fetchHimalayasJobs = require("./sources/himalayas");
const fetchJobicyJobs = require("./sources/jobicy");
const fetchArbeitnowJobs = require("./sources/arbeitnow");

const scoreJob = require("./jobScorer");
const analyzeJob = require("./jobAnalyzer");

async function fetchJobs(db) {
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

    // 1. Remove duplicate links within the raw scrape
    allJobs = allJobs.filter(
        (job, index, self) =>
            job.apply_link &&
            index === self.findIndex((j) => j.apply_link === job.apply_link)
    );

    // 2. Filter out jobs that ALREADY exist in your database
    if (db) {
        allJobs = allJobs.filter((job) => {
            try {
                const escapedLink = job.apply_link.replace(/'/g, "''");
                const res = db.exec(`SELECT id FROM jobs WHERE apply_link = '${escapedLink}'`);
                return !(res.length > 0 && res[0].values.length > 0);
            } catch (err) {
                return true;
            }
        });
    }

    // 3. Score and analyze remaining unseen jobs
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

    // Filter by quality threshold
    let qualifiedJobs = allJobs.filter((job) => job.score > 35);

    if (qualifiedJobs.length < 5) {
        console.log(`⚠️ Only ${qualifiedJobs.length} top-tier jobs found. Adjusting threshold...`);
        qualifiedJobs = allJobs.filter((job) => job.score > 20);
    }

    const finalSelection = qualifiedJobs.slice(0, 15);
    console.log(`✅ Selected ${finalSelection.length} new jobs for database insertion and alerts.`);

    return finalSelection;
}

module.exports = fetchJobs;
