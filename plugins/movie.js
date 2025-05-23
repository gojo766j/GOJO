const { cmd } = require('../command');
const axios = require('axios');
const config = require('../config');

cmd({
  pattern: 'movie',
  alias: ['moviedl', 'films'],
  react: '🎬',
  category: 'download',
  desc: 'Search Sinhala movies from Movie-api',
  filename: __filename
}, async (robin, m, mek, { from, q, reply }) => {
  try {
    if (!q || q.trim() === '') {
      return await reply('❌ Please provide a movie name! (e.g., .movie deadpool)');
    }

    // API URL එක - ඔයාගේ Movie-api server එකට 맞춰ලා දාන්න
    const apiUrl = `http://localhost:3000/sinhala-movies/search?q=${encodeURIComponent(q.trim())}`;

    // API key තියෙනවා නම් headers එකට එක් කරන්න, නැත්තම් skip කරන්න
    const headers = {};
    if (config.MOVIE_API_KEY) {
      headers['x-api-key'] = config.MOVIE_API_KEY;
    }

    const response = await axios.get(apiUrl, { headers });

    if (!response.data || !Array.isArray(response.data) || response.data.length === 0) {
      return await reply(`❌ No results found for: *${q}*`);
    }

    // Result එකේ පළවෙනි movie එක තෝරන්න
    const movie = response.data[0];

    // Movie info format කරන්න (ඔයාට ඕනම් වෙනස් කරන්න පුළුවන්)
    let msg = `🎬 *${movie.title}*\n`;
    if (movie.quality) msg += `Quality: ${movie.quality}\n`;
    msg += `Link: ${movie.link}`;

    await reply(msg);

  } catch (error) {
    console.error('Movie command error:', error.message);
    await reply('❌ Error fetching movie data. Please try again later.');
  }
});
