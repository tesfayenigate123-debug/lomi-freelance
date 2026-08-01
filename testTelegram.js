const sendJobToTelegram =
require("./services/telegram");


const testJob = {

    title: "Remote Office Assistant",

    company: "Test Company",

    location: "Worldwide",

    description: "Help with basic remote office tasks.",

    salary: "$15/hour",

    experience: "Beginner friendly"

};


sendJobToTelegram(testJob, 10)
.then(() => {

    console.log("Telegram test sent");

})
.catch(error => {

    console.log(
        "Telegram error:",
        error.message
    );

});
