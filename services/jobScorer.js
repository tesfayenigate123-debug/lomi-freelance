// ========================================
// Lomi Smart Job Scorer
// ========================================

function scoreJob(job) {

    const title =
        (job.title || "").toLowerCase();

    const description =
        (job.description || "").toLowerCase();

    const location =
        (job.location || "").toLowerCase();

    const source =
        (job.source || "").toLowerCase();

    const applyLink =
        job.apply_link || "";

    const text =
        `${title} ${description} ${location}`;

    let score = 0;

    let quality = "Poor";


    // ========================================
    // Remote Jobs
    // ========================================

    if (text.includes("remote")) {

        score += 30;

    }

    if (text.includes("worldwide")) {

        score += 10;

    }

    if (text.includes("hybrid")) {

        score -= 20;

    }

    if (
        text.includes("on-site") ||
        text.includes("onsite")
    ) {

        score -= 30;

    }


    // ========================================
    // Experience
    // ========================================

    if (
        text.includes("no experience") ||
        text.includes("no prior experience")
    ) {

        score += 20;

    }

    else if (
        text.includes("entry level") ||
        text.includes("entry-level")
    ) {

        score += 18;

    }

    else if (
        text.includes("0 year") ||
        text.includes("0-2") ||
        text.includes("0–2") ||
        text.includes("1 year") ||
        text.includes("2 years")
    ) {

        score += 15;

    }

    else if (
        text.includes("3 years") ||
        text.includes("4 years")
    ) {

        score += 5;

    }

    else if (
        text.includes("5 years") ||
        text.includes("6 years") ||
        text.includes("7 years") ||
        text.includes("8 years") ||
        text.includes("10 years")
    ) {

        score -= 20;

    }


    // ========================================
    // Salary
    // ========================================

    if (
        job.salary &&
        job.salary.trim() !== ""
    ) {

        score += 10;

    }


    // ========================================
    // Description Quality
    // ========================================

    if (
        description.length > 200
    ) {

        score += 10;

    }

    else if (
        description.length > 50
    ) {

        score += 5;

    }


    // ========================================
    // Trusted Source
    // ========================================

    if (

        source.includes("remotive") ||

        source.includes("himalayas") ||

        source.includes("jobicy")

    ) {

        score += 5;

    }


    // ========================================
    // Valid Apply Link
    // ========================================

    if (

        applyLink.startsWith("https://")

    ) {

        score += 5;

    }

    else {

        score -= 50;

    }


    // ========================================
    // Senior Roles
    // ========================================

    const seniorWords = [

        "senior",

        "lead",

        "manager",

        "director",

        "principal",

        "architect",

        "staff"

    ];


    if (

        seniorWords.some(word =>
            text.includes(word)
        )

    ) {

        score -= 30;

    }


    // ========================================
    // Country Restricted
    // ========================================

    const restricted = [

        "united states",

        "usa only",

        "us only",

        "canada only",

        "uk only",

        "europe only"

    ];


    if (

        restricted.some(word =>
            text.includes(word)
        )

    ) {

        score -= 20;

    }


    // ========================================
    // Quality
    // ========================================

    if (score >= 80) {

        quality = "Excellent";

    }

    else if (score >= 60) {

        quality = "Good";

    }

    else if (score >= 40) {

        quality = "Acceptable";

    }

    else {

        quality = "Poor";

    }


    return {

        score,

        quality

    };

}

module.exports = scoreJob;
