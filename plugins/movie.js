const { default: axios } = require('axios');
const { getBuffer } = require('../lib/functions');

module.exports = {
  name: 'movie',
  alias: ['film'],
  category: 'download',
  desc: 'Download SinhalaSub Movie by name',
  use: '.movie [movie name]',
  async exec(m, sock, args) {
    if (!args[0]) return m.reply('Please provide a movie name!\nUsage: .movie Inception');

    const movieName = args.join(' ');
    m.reply(`Searching for: *${movieName}*...`);

    try {
      // SinhalaSub.lk Scraper API or direct embed URL creation
      const searchUrl = `https://api.infinityapi.org/cine-direct-dl`;
      const cinesubUrl = `https://cinesubz.co/api-xxxx/${encodeURIComponent(movieName)}/`;

      const response = await axios.get(searchUrl, {
        headers: {
          'Authorization': 'Bearer Infinity-manoj-x-mizta'
        },
        params: {
          url: cinesubUrl
        }
      });

      const result = response.data;

      if (!result?.video || !result?.sub) {
        return m.reply('Movie or subtitle not found!');
      }

      const videoBuffer = await getBuffer(result.video);
      const subtitleBuffer = await getBuffer(result.sub);

      await sock.sendMessage(m.chat, {
        video: videoBuffer,
        mimetype: 'video/mp4',
        caption: `🎬 *${movieName}*\n\nSinhalaSub Movie`,
      }, { quoted: m });

      await sock.sendMessage(m.chat, {
        document: subtitleBuffer,
        mimetype: 'text/plain',
        fileName: `${movieName}.srt`,
      }, { quoted: m });

    } catch (err) {
      console.error(err);
      m.reply('Failed to fetch or send the movie. Check console for details.');
    }
  }
};
