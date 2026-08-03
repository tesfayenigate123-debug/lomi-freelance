// ========================================
// Save one job
// ========================================
function saveJob(db, job) {


    // Prevent undefined values
    job.title = job.title || "";
    job.company = job.company || "";
    job.location = job.location || "";
    job.description = job.description || "";
    job.category = job.category || "";
    job.salary = job.salary || "";
    job.experience = job.experience || "";
    job.source = job.source || "";
    job.apply_link = job.apply_link || "";
    job.posted_date = job.posted_date || "";
    job.score = job.score || 0;
    job.quality = job.quality || "";


    const today =
    new Date()
    .toISOString()
    .slice(0,10);


    job.collected_date = today;


    // Check if job already exists
    const existing =
    db.exec(
        "SELECT id FROM jobs WHERE apply_link = ?",
        [job.apply_link]
    );


    // Return existing ID
    if (
        existing[0] &&
        existing[0].values.length > 0
    ) {

        return existing[0].values[0][0];

    }


    // Insert new job
    db.run(

        `
        INSERT INTO jobs
        (
            title,
            company,
            location,
            description,
            category,
            salary,
            experience,
            source,
            apply_link,
            posted_date,
            collected_date,
            score,
            quality
        )

        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)

        `,

        [

            job.title,
            job.company,
            job.location,
            job.description,
            job.category,
            job.salary,
            job.experience,
            job.source,
            job.apply_link,
            job.posted_date,
            job.collected_date,
            job.score,
            job.quality

        ]

    );


    saveDatabase(db);


    const result =
    db.exec(
        "SELECT last_insert_rowid()"
    );


    return result[0].values[0][0];

}
