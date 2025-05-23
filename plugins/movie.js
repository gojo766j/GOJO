const { cmd } = require('../command');
const { fetchJson } = require('../lib/functions');
const config = require('../config');

const API_KEY = config.MOVIE_API_KEY;

cmd({
  pattern: "movie",
  alias: ["moviedl", "films"],
  react: "🎬",
  category: "download",
  desc: "Search Sinhala movies from Sayurami API",
  filename: __filename
}, async (robin, m, mek, { from, q, reply }) => {
  try {
    if (!q) return await reply('❌ Please provide a movie name!');

    const url = `https://movieapi.sayurami.repl.co/api/v1/movies?title=${encodeURIComponent(q)}&apikey=${API_KEY}`;
    const res = await fetchJson(url);

    if (!res || !res.movie || res.movie.length === 0) {
      return await reply(`❌ No Sinhala movie found for: *${q}*`);
    }

    const movie = res.movie[0]; // First result

    let message = `🎬 *${movie.title}*\n`;
    message += `📅 Year: ${movie.year}\n`;
    message += `📁 Size: ${movie.size}\n`;
    message += `🔗 Download: ${movie.download_link}`;

    await reply(message);
  } catch (err) {
    console.log(err);
    await reply('❌ Something went wrong while fetching the movie.');
  }
});
