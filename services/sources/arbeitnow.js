const axios = require("axios");

async function fetchArbeitnowJobs() {
    console.log("📡 Fetching jobs from Arbeitnow API...");
    try {
        const response = await axios.get("https://www.arbeitnow.com/api/v1/jobs", {
            headers: { "User-Agent": "LomiFreelanceBot/1.0" }
        });

        const jobs = response.data.data || [];

        // Filter for remote-friendly jobs
        return jobs
            .filter((item) => item.remote === true || item.location.toLowerCase().includes("remote"))
            .map((item) => ({
                title: item.title || "Remote Role",
                company: item.company_name || "Arbeitnow Partner",
                location: "Worldwide Remote",
                description: item.description || "",
                category: item.tags ? item.tags.join(", ") : "General Remote",
                salary: "N/A",
                experience: "Entry / Mid",
                source: "Arbeitnow",
                apply_link: item.url,
                posted_date: item.created_at ? new Date(item.created_at * 1000).toISOString().slice(0, 10) : new Date().toISOString().slice(0, 10)
            }));
    } catch (error) {
        console.error("⚠️ Arbeitnow Fetch Error:", error.message);
        return [];
    }
}

module.exports = fetchArbeitnowJobs;
