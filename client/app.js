// ========================================
// Global State
// ========================================
let allJobs = [];

// ========================================
// Load Jobs from Express API
// ========================================
document.addEventListener("DOMContentLoaded", () => {
    fetchJobs();
    setupEventListeners();
});

function fetchJobs() {
    fetch("/jobs")
        .then((response) => response.json())
        .then((data) => {
            if (Array.isArray(data)) {
                allJobs = data;
            } else if (data && data[0] && data[0].values) {
                allJobs = data[0].values;
            } else {
                allJobs = [];
            }
            filterAndDisplayJobs();
        })
        .catch((error) => {
            console.error("Error loading jobs:", error);
            const container = document.getElementById("jobs-container");
            if (container) {
                container.innerHTML = "<p>Failed to load jobs. Please try again later.</p>";
            }
        });
}

// ========================================
// Event Listeners for Search & Filter
// ========================================
function setupEventListeners() {
    const searchInput = document.getElementById("search");
    const categorySelect = document.getElementById("category");

    if (searchInput) {
        searchInput.addEventListener("input", filterAndDisplayJobs);
    }

    if (categorySelect) {
        categorySelect.addEventListener("change", filterAndDisplayJobs);
    }
}

// ========================================
// Filter Logic
// ========================================
function filterAndDisplayJobs() {
    const searchVal = (document.getElementById("search")?.value || "").toLowerCase().trim();
    const categoryVal = (document.getElementById("category")?.value || "all").toLowerCase();

    const filtered = allJobs.filter((job) => {
        const title = (job.title || job[1] || "").toLowerCase();
        const company = (job.company || job[2] || "").toLowerCase();
        const description = (job.description || job[4] || "").toLowerCase();
        const category = (job.category || job[5] || "").toLowerCase();

        // 1. Search Query Match
        const matchesSearch =
            !searchVal ||
            title.includes(searchVal) ||
            company.includes(searchVal) ||
            description.includes(searchVal);

        // 2. Category Match
        const matchesCategory =
            categoryVal === "all" ||
            category.includes(categoryVal) ||
            title.includes(categoryVal);

        return matchesSearch && matchesCategory;
    });

    displayJobs(filtered);
}

// ========================================
// Render Job Cards
// ========================================
function displayJobs(jobs) {
    const container = document.getElementById("jobs-container");
    if (!container) return;

    container.innerHTML = "";

    if (!jobs || jobs.length === 0) {
        container.innerHTML = "<p>No matching remote jobs found.</p>";
        return;
    }

    jobs.forEach((job) => {
        const id = job.id || job[0];
        const title = job.title || job[1] || "Untitled Position";
        const company = job.company || job[2] || "";
        const location = job.location || job[3] || "Remote";
        const rawDescription = job.description || job[4] || "";
        const category = job.category || job[5] || "";
        const salary = job.salary || job[6] || "";
        const experience = job.experience || job[7] || "";
        const source = job.source || job[8] || "";
        const score = job.score !== undefined ? job.score : job[12] || 0;

        // Badges
        let badges = `<span class="badge beginner">🟢 Beginner Friendly</span>`;
        badges += `<span class="badge new">🆕 New</span>`;

        if (salary && salary !== "N/A" && salary !== "Not specified") {
            badges += `<span class="badge salary">💰 Salary Listed</span>`;
        }

        if (
            location &&
            (
                location.toLowerCase().includes("remote") ||
                location.toLowerCase().includes("world") ||
                location.toLowerCase().includes("anywhere") ||
                location.toLowerCase().includes("global")
            )
        ) {
            badges += `<span class="badge beginner">🌍 Worldwide</span>`;
        }

        // Short Description (Clean HTML & Cap 50 Words)
        let shortDescription = "";
        if (rawDescription && rawDescription !== "No description provided") {
            const cleanText = rawDescription.replace(/<[^>]*>?/gm, "").replace(/\s+/g, " ").trim();
            const words = cleanText.split(" ");
            shortDescription = words.slice(0, 50).join(" ");
            if (words.length > 50) shortDescription += "...";
        }

        container.innerHTML += `
        <div class="job-card">
            <div class="badges-wrapper">${badges}</div>
            <h3>💼 ${title}</h3>
            ${company ? `<p>🏢 Company: ${company}</p>` : ""}
            ${location ? `<p>🌍 Location: ${location}</p>` : ""}
            ${shortDescription ? `<p>📝 ${shortDescription}</p>` : ""}
            ${category ? `<p>📂 Category: ${category}</p>` : ""}
            ${salary ? `<p>💰 Salary: ${salary}</p>` : ""}
            ${experience ? `<p>📈 Experience: ${experience}</p>` : ""}
            ${source ? `<p>🌐 Found by Lomi from: ${source}</p>` : ""}
            ${score ? `<p>⭐ Lomi Score: ${score}</p>` : ""}
            <a href="/job/${id}">View & Apply</a>
        </div>
        `;
    });
}
