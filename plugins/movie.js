const { cmd } = require('../command');
const axios = require('axios');
const config = require('../config');

const API_KEY = config.MOVIE_API_KEY;
const API_URL = "https://your-api-url.com/sinhala-movies/search"; // Replace with real API URL

cmd({
    pattern: "movie",
    alias: ["films", "moviedl"],
    react: '🎬',
    category: "search",
    desc: "Search a Sinhala movie",
    filename: __filename
}, async (robin, m, mek, { q, reply }) => {
    if (!q) return reply("❌ Please provide a movie title (e.g., *Deadpool*)");

    try {
        const { data } = await axios.get(`${API_URL}?q=${encodeURIComponent(q)}`, {
            headers: { 'x-api-key': API_KEY }
        });

        if (!Array.isArray(data) || data.length === 0) {
            return reply(`❌ No Sinhala movie found for: *${q}*`);
        }

        const movie = data[0]; // Only take first match

        let msg = `🎬 *${movie.title}*\n`;
        msg += `📽️ *Quality:* ${movie.quality || 'Unknown'}\n`;
        msg += `🔗 *Watch/Download:* ${movie.link}`;

        await robin.sendMessage(m.chat, {
            image: { url: movie.image },
            caption: msg
        }, { quoted: mek });

    } catch (err) {
        console.error("Movie error:", err);
        reply("❌ Error fetching movie. Check server or API key.");
    }
});
