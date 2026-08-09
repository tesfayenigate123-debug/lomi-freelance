document.addEventListener("DOMContentLoaded", () => {
    fetchJobs();
    fetchStats();
});

async function fetchStats() {
    try {
        const res = await fetch("/stats");
        const data = await res.json();
        const visitorElem = document.getElementById("visitor-count");
        if (visitorElem) {
            visitorElem.innerText = `💼 Total Jobs Available: ${data.totalJobs} | 👁️ Total Visits: ${data.visitors}`;
        }
    } catch (err) {
        console.error("Failed to load stats:", err);
    }
}

async function fetchJobs() {
    const jobListElem = document.getElementById("job-list");
    if (!jobListElem) return;

    try {
        jobListElem.innerHTML = "<p>Loading fresh remote jobs...</p>";
        const res = await fetch("/jobs");
        const jobs = await res.json();

        if (!Array.isArray(jobs) || jobs.length === 0) {
            jobListElem.innerHTML = "<p>No jobs available right now. Check back at 12:10 PM!</p>";
            return;
        }

        renderJobs(jobs);
        setupCategoryFilters(jobs);
    } catch (err) {
        console.error("Error loading jobs:", err);
        jobListElem.innerHTML = "<p>Failed to load jobs. Please refresh.</p>";
    }
}

function getPaymentBadge(job) {
    const text = (job.title + " " + (job.description || "") + " " + (job.salary || "")).toLowerCase();
    
    if (text.includes("usd") || text.includes("$") || text.includes("hourly") || text.includes("per year")) {
        return `<span style="background:#e0f2fe; color:#0369a1; padding:3px 8px; border-radius:4px; font-size:12px; font-weight:600;">💵 USD / International Pay</span>`;
    }
    return `<span style="background:#f3f4f6; color:#374151; padding:3px 8px; border-radius:4px; font-size:12px; font-weight:600;">🌐 Remote Verified</span>`;
}

function getExperienceBadge(exp) {
    const str = (exp || "").toLowerCase();
    if (str.includes("entry") || str.includes("junior") || str === "n/a") {
        return `<span style="background:#dcfce7; color:#15803d; padding:3px 8px; border-radius:4px; font-size:12px; font-weight:600;">🌱 Beginner Friendly</span>`;
    }
    return `<span style="background:#fef3c7; color:#b45309; padding:3px 8px; border-radius:4px; font-size:12px; font-weight:600;">💼 ${exp}</span>`;
}

function renderJobs(jobs) {
    const jobListElem = document.getElementById("job-list");
    jobListElem.innerHTML = "";

    jobs.forEach((job) => {
        const card = document.createElement("div");
        card.className = "job-card";
        card.style = "background:#fff; border:1px solid #e5e7eb; border-radius:8px; padding:16px; margin-bottom:16px;";

        card.innerHTML = `
            <div style="display:flex; gap:8px; margin-bottom:8px; flex-wrap:wrap;">
                ${getExperienceBadge(job.experience)}
                ${getPaymentBadge(job)}
            </div>
            <h3 style="margin:4px 0 8px 0; font-size:18px;">${job.title}</h3>
            <p style="color:#4b5563; font-size:14px; margin:0 0 12px 0;">🏢 <strong>${job.company || "Remote Company"}</strong> | 📂 ${job.category || "General"}</p>
            <div style="display:flex; gap:10px; align-items:center;">
                <a href="/job/${job.id}" style="background:#000; color:#fff; text-decoration:none; padding:8px 16px; border-radius:6px; font-size:14px; font-weight:500;">View Details & Apply ↗</a>
            </div>
        `;
        jobListElem.appendChild(card);
    });
}

function setupCategoryFilters(allJobs) {
    const filterContainer = document.getElementById("category-filters");
    if (!filterContainer) return;

    filterContainer.innerHTML = `
        <button onclick="window.filterCategory('all')" class="filter-btn">All Jobs</button>
        <button onclick="window.filterCategory('beginner')" class="filter-btn">🌱 Beginner Friendly</button>
        <button onclick="window.filterCategory('usd')" class="filter-btn">💵 USD Currency</button>
    `;

    window.filterCategory = (type) => {
        if (type === "all") {
            renderJobs(allJobs);
        } else if (type === "beginner") {
            const filtered = allJobs.filter((j) => (j.experience || "").toLowerCase().includes("entry") || (j.experience || "").toLowerCase().includes("junior"));
            renderJobs(filtered.length ? filtered : allJobs);
        } else if (type === "usd") {
            const filtered = allJobs.filter((j) => (j.title + (j.salary || "") + (j.description || "")).toLowerCase().includes("usd") || (j.title + (j.salary || "")).includes("$"));
            renderJobs(filtered.length ? filtered : allJobs);
        }
    };
}
