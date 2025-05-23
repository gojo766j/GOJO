const { cmd } = require('../command');
const axios = require('axios');
const config = require('../config');

const API_URL = "https://movie-api.sayurami.repl.co/movies";
const API_KEY = config.MOVIE_API_KEY;

cmd({
    pattern: "movie",
    alias: ["moviedl", "films"],
    react: '🎬',
    category: "download",
    desc: "Search Sinhala sub movies",
    filename: __filename
}, async (robin, m, mek, { from, q, reply }) => {
    try {
        if (!q || q.trim() === '') return await reply('❌ Please provide a movie name! (e.g., Theri)');

        const searchUrl = `${API_URL}?q=${encodeURIComponent(q)}&api_key=${API_KEY}`;
        const res = await axios.get(searchUrl);

        if (!res.data || res.data.length === 0) {
            return await reply(`❌ No Sinhala movie found for: *${q}*`);
        }

        const movie = res.data[0]; // First movie result
        let caption = `🎬 *${movie.title}*\n\n🗂 Category: ${movie.category}\n📅 Year: ${movie.year}\n\n🔗 Link: ${movie.link}`;

        await robin.sendMessage(from, {
            text: caption,
            quoted: mek
        });

    } catch (err) {
        console.error("Movie command error:", err.message);
        await reply('❌ Error fetching movie data. Check API or try again later.');
    }
});
