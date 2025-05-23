const axios = require('axios');
const cheerio = require('cheerio');
const { cmd } = require('../command');

async function getMovieByName(name) {
    try {
        const searchUrl = `https://sinhalasub.lk/?s=${encodeURIComponent(name)}`;
        const { data } = await axios.get(searchUrl);
        const $ = cheerio.load(data);

        const movies = [];

        $('.jeg_postblock').each((i, elem) => {
            const title = $(elem).find('.jeg_post_title a').text().trim();
            const link = $(elem).find('.jeg_post_title a').attr('href');

            if (title && link) {
                movies.push({ title, link });
            }
        });

        return movies;
    } catch (error) {
        console.error('Error in getMovieByName:', error);
        return [];
    }
}

cmd({
    pattern: "movie",
    alias: ["moviedl", "films"],
    react: '🎬',
    category: "search",
    desc: "Search movies from SinhalaSub.lk",
    filename: __filename
}, async (robin, m, mek, { from, q, reply }) => {
    try {
        if (!q || q.trim() === '') {
            return await reply('❌ කරුණාකර චිත්‍රපටයක නමක් ලබා දෙන්න! (උදා: avengers)');
        }

        const movies = await getMovieByName(q);

        if (!movies || movies.length === 0) {
            return await reply(`❌ *${q}* සඳහා චිත්‍රපට හමු නොවීය.`);
        }

        const replyText = movies.slice(0, 5).map(movie => (
            `🎬 *${movie.title}*\n🔗 ${movie.link}`
        )).join('\n\n');

        await reply(replyText);

    } catch (error) {
        console.error('SinhalaSub Movie Error:', error);
        await reply('❌ සමාවෙන්න, දෝෂයක් සිදු විය.');
    }
});
