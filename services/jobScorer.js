// ========================================
// Lomi Approved Categories
// ========================================

const categories = {

    "Data Entry": [
        "data entry",
        "data clerk",
        "data specialist"
    ],

    "Chat Operator": [
        "chat",
        "live chat"
    ],

    "Appointment Setter": [
        "appointment setter",
        "appointment"
    ],

    "Survey": [
        "survey",
        "market research"
    ],

    "QA Tester": [
        "qa",
        "quality assurance",
        "tester",
        "testing"
    ],

    "Social Media": [
        "social media",
        "facebook",
        "instagram",
        "tiktok",
        "content moderator"
    ],

    "Virtual Assistant": [
        "virtual assistant",
        "administrative assistant",
        "admin assistant",
        "executive assistant"
    ],

    "Transcription": [
        "transcription",
        "transcriber"
    ],

    "Community Moderator": [
        "community",
        "moderator"
    ],

    "Online Tutor": [
        "tutor",
        "teaching assistant",
        "teacher"
    ],

    "Customer Support": [
        "customer support",
        "customer service",
        "support specialist",
        "support representative",
        "email support"
    ]

};



// ========================================
// Score Job
// ========================================

function scoreJob(job) {

    let score = 0;

    const text = (
        (job.title || "") +
        " " +
        (job.description || "")
    ).toLowerCase();



    // Detect category

    let detectedCategory = "";

    for (const category in categories) {

        if (

            categories[category].some(
                keyword => text.includes(keyword)
            )

        ) {

            detectedCategory = category;

            score += 20;

            break;

        }

    }



    // Remote

    if (

        (job.location || "")
        .toLowerCase()
        .includes("remote")

    ) {

        score += 25;

    }



    // Worldwide

    const location =
        (job.location || "").toLowerCase();

    if (

        location.includes("world") ||
        location.includes("global") ||
        location.includes("anywhere")

    ) {

        score += 20;

    }



    // Description

    if (

        job.description &&
        job.description.length > 40

    ) {

        score += 5;

    }



    // Salary

    if (

        job.salary &&
        job.salary.trim() !== ""

    ) {

        score += 10;

    }



    // Apply link

    if (

        job.apply_link &&
        job.apply_link.startsWith("http")

    ) {

        score += 10;

    }



    return {

        score,

        quality:
            score >= 75
            ? "Excellent"
            : score >= 60
            ? "Good"
            : "Poor",

        category:
            detectedCategory

    };

}

module.exports = scoreJob;
