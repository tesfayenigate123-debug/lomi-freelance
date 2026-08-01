const Parser = require("rss-parser");

const parser = new Parser();


async function fetchWWRJobs() {

    try {

        const feed = await parser.parseURL(
            "https://weworkremotely.com/categories/remote-customer-support-jobs.rss"
        );


        return feed.items.map(job => ({

            title: job.title,

            company: "We Work Remotely",

            description: job.contentSnippet || "",

            location: "Remote Worldwide",

            category: "Customer Support",

            salary: "",

            experience: "",

            source: "We Work Remotely",

            apply_link: job.link,

            posted_date:
            job.pubDate || new Date().toISOString()

        }));


    } catch(error) {


        console.log(
            "WWR error:",
            error.message
        );


        return [];

    }

}


module.exports = fetchWWRJobs;
