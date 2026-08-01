// ========================================
// Analyze Job
// ========================================

function analyzeJob(job) {

    const text = (
        (job.title || "") +
        " " +
        (job.description || "")
    ).toLowerCase();


    // ----------------------
    // Experience
    // ----------------------

    let experience = "";

    if (
        text.includes("no experience") ||
        text.includes("entry level") ||
        text.includes("training provided") ||
        text.includes("no prior experience")
    ) {

        experience = "Entry Level";

    }

    else if (
        text.includes("1 year") ||
        text.includes("2 years")
    ) {

        experience = "Junior";

    }

    else if (
        text.includes("3 years") ||
        text.includes("4 years")
    ) {

        experience = "Intermediate";

    }

    else if (
        text.includes("5 years") ||
        text.includes("senior")
    ) {

        experience = "Senior";

    }


    // ----------------------
    // Salary
    // ----------------------

    let salary = job.salary || "";

    if (!salary) {

        const match = text.match(
            /\$[\d,]+(\.\d+)?(\s*-\s*\$?[\d,]+(\.\d+)?)?(\s*\/\s*(hour|hr|day|week|month|year))?/i
        );

        if (match) {

            salary = match[0];

        }

    }


    return {

        experience,

        salary

    };

}

module.exports = analyzeJob;
