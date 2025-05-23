const { cmd } = require('../command');
const { getMovieByName } = require('./scraper');

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

        if (!movies || !movies.length) {
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
