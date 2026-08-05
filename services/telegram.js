const TelegramBot = require("node-telegram-bot-api");
require("dotenv").config();

const bot = new TelegramBot(process.env.TELEGRAM_BOT_TOKEN);

// Helper to escape HTML special characters to prevent Telegram API errors
function escapeHTML(str = "") {
    return str
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;");
}

// Helper to strip HTML tags from raw scraper descriptions and truncate safely
function cleanDescription(text = "", maxLength = 280) {
    const plainText = text.replace(/<[^>]*>?/gm, "").replace(/\s+/g, " ").trim();
    if (plainText.length <= maxLength) return plainText;
    return plainText.substring(0, maxLength) + "...";
}

async function sendJobToTelegram(job, jobId) {
    try {
        const title = escapeHTML(job.title || "Remote Position");
        const company = escapeHTML(job.company || "Not specified");
        const location = escapeHTML(job.location || "Worldwide Remote");
        const salary = escapeHTML(job.salary || "Not specified");
        const experience = escapeHTML(job.experience || "Entry / Mid Level");
        const description = escapeHTML(cleanDescription(job.description));

        const message = 
`<b>🆕 New Remote Job</b>

<b>💼 Position:</b> ${title}
<b>🏢 Company:</b> ${company}
<b>🌍 Location:</b> ${location}
<b>💰 Salary:</b> ${salary}
<b>📈 Experience:</b> ${experience}

<b>📝 Description:</b>
${description}`;

        // Ensure base URL formatted without trailing slash
        const baseUrl = (process.env.LOMI_URL || "http://localhost:3000").replace(/\/$/, "");
        const link = `${baseUrl}/job/${encodeURIComponent(jobId)}`;

        await bot.sendMessage(
            process.env.TELEGRAM_GROUP_ID,
            message,
            {
                parse_mode: "HTML",
                disable_web_page_preview: true,
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

        console.log(`✅ Telegram alert sent for Job ID: ${jobId}`);

    } catch (error) {
        console.error("❌ Telegram dispatch error:", error.message);
    }
}

module.exports = sendJobToTelegram;
