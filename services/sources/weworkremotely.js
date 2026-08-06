const Parser = require("rss-parser");
const parser = new Parser();

const FEEDS = [
    "https://weworkremotely.com/categories/remote-customer-support-jobs.rss",
    "https://weworkremotely.com/categories/remote-copywriting-jobs.rss",
    "https://weworkremotely.com/categories/remote-programming-jobs.rss"
];

async function fetchWeWorkRemotelyJobs() {
    console.log("📡 Fetching jobs from We Work Remotely RSS feeds...");
    const jobs = [];

    for (const feedUrl of FEEDS) {
        try {
            const feed = await parser.parseURL(feedUrl);
            for (const item of feed.items) {
                jobs.push({
                    title: item.title || "Remote Role",
                    company: item.creator || "We Work Remotely",
                    location: "Remote",
                    description: item.contentSnippet || item.content || "",
                    category: "General Remote",
                    salary: "N/A",
                    experience: "Entry / Mid",
                    source: "WeWorkRemotely",
                    apply_link: item.link,
                    posted_date: item.pubDate ? new Date(item.pubDate).toISOString().slice(0, 10) : new Date().toISOString().slice(0, 10)
                });
            }
        } catch (error) {
            console.error(`⚠️ WWR Feed Error (${feedUrl}):`, error.message);
        }
    }

    return jobs;
}

module.exports = fetchWeWorkRemotelyJobs;
