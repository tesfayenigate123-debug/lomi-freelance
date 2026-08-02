// ========================================
// Module imports
// ========================================
const express = require("express");

const {
    initializeDatabase
} = require("./database/db");


// ========================================
// Create Express application
// ========================================
const app = express();


// ========================================
// Port number (Railway compatible)
// ========================================
const PORT = process.env.PORT || 3000;


// ========================================
// Middleware
// ========================================
app.use(express.json());

app.use(express.static("client"));


// Database variable
let db;


// ========================================
// Home route
// ========================================
app.get("/", (req, res) => {

    res.send(
        "Welcome to Lomi Freelance"
    );

});


// ========================================
// Add a new freelance job
// ========================================
app.post("/jobs", (req, res) => {

    const {
        title,
        company,
        location,
        source,
        apply_link,
        posted_date
    } = req.body;


    db.run(
        `
        INSERT INTO jobs
        (
            title,
            company,
            location,
            source,
            apply_link,
            posted_date
        )

        VALUES (?, ?, ?, ?, ?, ?)
        `,
        [
            title,
            company,
            location,
            source,
            apply_link,
            posted_date
        ]
    );


    res.json({
        message: "Job added successfully"
    });

});


// ========================================
// Get all freelance jobs
// ========================================
app.get("/jobs", (req, res) => {

    const result =
    db.exec(
        "SELECT * FROM jobs ORDER BY id DESC"
    );


    res.json(result);

});


// ========================================
// Single Lomi job page
// ========================================
app.get("/job/:id", (req, res) => {

    const id = Number(req.params.id);


    const result =
    db.exec(
        "SELECT * FROM jobs WHERE id = ?",
        [id]
    );


    if (
        !result[0] ||
        result[0].values.length === 0
    ) {

        return res.send(
            "<h2>Job not found</h2>"
        );

    }


    const job =
    result[0].values[0];


    res.send(`

<!DOCTYPE html>

<html>

<head>

<title>
${job[1]} - Lomi Freelance
</title>


<style>

body {
    font-family: Arial, sans-serif;
    margin: 30px;
}

.job-card {

    max-width:700px;
    border:1px solid #ddd;
    padding:20px;
    border-radius:10px;

}

.apply {

    display:inline-block;
    margin-top:20px;
    padding:12px 20px;
    background:black;
    color:white;
    text-decoration:none;
    border-radius:5px;

}

</style>

</head>


<body>


<div class="job-card">


<h1>
💼 ${job[1]}
</h1>


${job[2] ? `<p>🏢 Company: ${job[2]}</p>` : ""}

${job[3] ? `<p>🌍 Location: ${job[3]}</p>` : ""}

${job[4] ? `<p>📝 ${job[4]}</p>` : ""}

${job[5] ? `<p>📂 Category: ${job[5]}</p>` : ""}

${job[6] ? `<p>💰 Salary: ${job[6]}</p>` : ""}

${job[7] ? `<p>📈 Experience: ${job[7]}</p>` : ""}


<a class="apply"
href="${job[9]}"
target="_blank">

Apply Now

</a>


</div>


</body>

</html>

`);

});



// ========================================
// Start server
// ========================================
async function startServer() {

    try {

        db = await initializeDatabase();


        console.log(
            "✅ Database initialized."
        );


        // Start scheduler
        require("./scheduler/dailyJobs")(db);


        app.listen(
            PORT,
            "0.0.0.0",
            () => {

                console.log(
                    `🚀 Server running on port ${PORT}`
                );

            }
        );


    } catch(error) {

        console.log(
            "❌ Server startup error:",
            error.message
        );

        process.exit(1);

    }

}


startServer();
