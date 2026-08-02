const TelegramBot = require("node-telegram-bot-api");
require("dotenv").config();


const bot = new TelegramBot(
    process.env.TELEGRAM_BOT_TOKEN
);


async function sendJobToTelegram(job, jobId) {

    try {

        const message = `
🆕 New Remote Job

💼 ${job.title}

🏢 ${job.company || "Not specified"}

🌍 ${job.location || "Remote"}

📝 ${job.description || ""}

💰 ${job.salary || ""}

📈 ${job.experience || ""}

Apply through Lomi:
`;

        const link =
        `${process.env.LOMI_URL}/job/${jobId}`;


        await bot.sendMessage(
            process.env.TELEGRAM_GROUP_ID,
            message,
            {
                reply_markup: {
                    inline_keyboard: [
                        [
                            {
                                text: "🔗 Apply on Lomi",
                                url: link
                            }
                        ]
                    ]
                }
            }
        );


        console.log("✅ Telegram sent");


    } catch(error) {

        console.log(
            "❌ Telegram error:",
            error.message
        );

    }

}

module.exports = sendJobToTelegram;
