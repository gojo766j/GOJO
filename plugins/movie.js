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
        if (!q || q.trim() === '') return await reply('❌ කරුණාකර චිත්‍රපටයක් නම් කරන්න! (උදා: avengers)');

        const movies = await getMovieByName(q);

        if (!movies.length) {
            return await reply(`❌ *${q}* සඳහා චිත්‍රපට සොයාගත නොහැකි විය.`);
        }

        // Response message (up to 5 results)
        const replyText = movies.slice(0, 5).map(m => `🎬 ${m.title}\n🔗 ${m.link}`).join('\n\n');

        await reply(replyText);

    } catch (error) {
        console.error('Error in movie command:', error);
        await reply('❌ සමාවෙන්න, දෝෂයක් සිදුවී ඇත. නැවත උත්සාහ කරන්න.');
    }
});
