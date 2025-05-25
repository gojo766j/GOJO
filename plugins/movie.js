const { cmd } = require('../command');
const axios = require('axios');
const fs = require('fs-extra');
const path = require('path');
const { searchSinhalaMovie } = require('dark-yasiya-sinhalasub.lk');

const waitingForQuality = {};

cmd({
  pattern: "movie",
  alias: ["moviedl", "films"],
  react: '🎬',
  category: "download",
  desc: "Search and download Sinhala movies with quality selection",
  filename: __filename
}, async (robin, m, mek, { from, q, reply }) => {
  try {
    if (!q || !q.trim()) return await reply('❌ Please provide a movie name!');

    await reply(`🔍 Searching for *${q.trim()}*...`);

    const movieData = await searchSinhalaMovie(q.trim());
    if (!movieData || !movieData.qualities || movieData.qualities.length === 0) {
      return await reply(`❌ No download links found for: *${q.trim()}*`);
    }

    waitingForQuality[mek.key.id] = { movieData, mek };

    let msg = `🎬 *${movieData.title}* - Available Qualities:\n`;
    movieData.qualities.forEach((quality, idx) => {
      msg += `\n${idx + 1}. ${quality.quality} (${quality.size || 'Unknown size'})`;
    });
    msg += `\n\n👉 *Reply to this message* with the number to select quality.`;

    await reply(msg);
  } catch (error) {
    console.error('Search error:', error);
    await reply('❌ An error occurred while searching for the movie.');
  }
});

cmd({
  on: 'text',
  filename: __filename
}, async (robin, m, mek, { from, reply, body }) => {
  try {
    const isReply = mek?.message?.extendedTextMessage?.contextInfo?.stanzaId;
    const replyId = mek?.message?.extendedTextMessage?.contextInfo?.stanzaId;

    if (!isReply || !waitingForQuality[replyId]) return;

    const selected = parseInt(body.trim());
    if (isNaN(selected)) return;

    const { movieData, mek: originalMek } = waitingForQuality[replyId];
    const qualities = movieData.qualities;

    if (selected < 1 || selected > qualities.length) {
      return await reply('❌ Invalid number. Please select a valid quality number.');
    }

    const selectedQuality = qualities[selected - 1];
    const downloadUrl = selectedQuality.link;

    const safeTitle = movieData.title.replace(/[^\w\s]/gi, '');
    const fileName = `${safeTitle}-${selectedQuality.quality}.mp4`;
    const filePath = path.join(__dirname, fileName);

    await reply(`⏳ Downloading *${movieData.title}* in *${selectedQuality.quality}*...`);

    const writer = fs.createWriteStream(filePath);
    const response = await axios({
      url: downloadUrl,
      method: 'GET',
      responseType: 'stream',
      headers: { 'User-Agent': 'Mozilla/5.0' }
    });

    response.data.pipe(writer);

    writer.on('finish', async () => {
      await robin.sendMessage(from, {
        document: fs.readFileSync(filePath),
        mimetype: 'video/mp4',
        fileName,
        caption: `🎬 *${movieData.title}*\nQuality: ${selectedQuality.quality}\n✅ Download Complete!`,
        quoted: originalMek
      });
      fs.unlinkSync(filePath);
      delete waitingForQuality[replyId];
    });

    writer.on('error', async (err) => {
      console.error('Download Error:', err);
      await reply('❌ Failed to download or send the movie.');
      delete waitingForQuality[replyId];
    });

  } catch (error) {
    console.error('Reply handler error:', error);
    await reply('❌ Error while processing your reply.');
  }
});
