// ========================================
// Store jobs
// Structure: Array variable
// ========================================
let allJobs = [];


// ========================================
// Load jobs from server
// Structure: Fetch API
// ========================================
fetch("/jobs")

.then(response => response.json())

.then(data => {


    // sql.js returns {columns, values}
    allJobs = data[0]?.values || [];


    displayJobs(allJobs);


})

.catch(error => {

    console.log(
        "Error loading jobs:",
        error
    );

});





// ========================================
// Display jobs
// Structure: Function definition
// ========================================
function displayJobs(jobs) {


    const container =
    document.getElementById(
        "jobs-container"
    );


    container.innerHTML = "";



    if (jobs.length === 0) {


        container.innerHTML =
        "<p>No jobs available.</p>";


        return;

    }



    jobs.forEach(job => {



        // ========================================
        // Create badges
        // ========================================

        let badges = "";


        // Beginner badge
        badges += `
        <span class="badge beginner">
        🟢 Beginner Friendly
        </span>
        `;



        // New badge
        badges += `
        <span class="badge new">
        🆕 New
        </span>
        `;



        // Salary badge
        if (
            job[6] &&
            job[6] !== "Not specified"
        ) {

            badges += `
            <span class="badge salary">
            💰 Salary Listed
            </span>
            `;

        }



        // Worldwide badge
        if (
            job[3] &&
            (
                job[3].toLowerCase().includes("remote") ||
                job[3].toLowerCase().includes("world") ||
                job[3].toLowerCase().includes("anywhere") ||
                job[3].toLowerCase().includes("global")
            )
        ) {

            badges += `
            <span class="badge beginner">
            🌍 Worldwide
            </span>
            `;

        }




        // ========================================
        // Short description
        // Maximum 50 words
        // ========================================

        let shortDescription = "";


        if (
            job[4] &&
            job[4] !== "No description provided"
        ) {

            let words =
            job[4].split(" ");


            shortDescription =
            words
            .slice(0,50)
            .join(" ");


            if(words.length > 50){

                shortDescription += "...";

            }

        }




        // ========================================
        // Create Job Card
        // ========================================

        container.innerHTML += `

        <div class="job-card">


            ${badges}


            <h3>
                💼 ${job[1]}
            </h3>



            ${
                job[2]
                ?
                `<p>🏢 Company: ${job[2]}</p>`
                :
                ""
            }



            ${
                job[3]
                ?
                `<p>🌍 Location: ${job[3]}</p>`
                :
                ""
            }



            ${
                shortDescription
                ?
                `<p>📝 ${shortDescription}</p>`
                :
                ""
            }



            ${
                job[5]
                ?
                `<p>📂 Category: ${job[5]}</p>`
                :
                ""
            }



            ${
                job[6]
                ?
                `<p>💰 Salary: ${job[6]}</p>`
                :
                ""
            }



            ${
                job[7]
                ?
                `<p>📈 Experience: ${job[7]}</p>`
                :
                ""
            }



            ${
                job[8]
                ?
                `<p>🌐 Found by Lomi from: ${job[8]}</p>`
                :
                ""
            }



            ${
                job[11]
                ?
                `<p>⭐ Lomi Score: ${job[11]}</p>`
                :
                ""
            }



            <a
            href="${job[9]}"
            target="_blank">

                Apply Now

            </a>


        </div>

        `;


    });


}
