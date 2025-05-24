const { cmd } = require('../command');
const { getBuffer } = require('../lib/functions');
const axios = require('axios');
const cheerio = require('cheerio');
const fs = require('fs-extra');
const path = require('path');

cmd({
  pattern: "movie",
  category: "download",
  react: '🎬',
  desc: "Download movie and Sinhala subtitles from SinhalaSub.lk",
  filename: __filename
}, async (robin, m, mek, { from, q, reply }) => {
  if (!q) return reply("❌ Please provide a movie name (e.g., .movie Deadpool)");

  try {
    const searchUrl = `https://www.sinhalasub.lk/?s=${encodeURIComponent(q)}`;
    const searchRes = await axios.get(searchUrl);
    const $ = cheerio.load(searchRes.data);

    const moviePageLink = $('h2.entry-title > a').first().attr('href');
    if (!moviePageLink) return reply("❌ Movie not found on SinhalaSub.lk");

    const moviePageRes = await axios.get(moviePageLink);
    const $$ = cheerio.load(moviePageRes.data);

    const videoLink = $$('a[href*=".mp4"], a[href*="mega.nz"], a[href*="drive.google.com"]').attr('href');
    const subtitleLink = $$('a[href*=".zip"], a[href*=".srt"]').attr('href');

    if (!videoLink || !subtitleLink) return reply("❌ Video or Subtitle link not found");

    // Download subtitle
    const subtitlePath = path.join(__dirname, `${q}-subs.zip`);
    const subRes = await axios({ url: subtitleLink, method: 'GET', responseType: 'stream' });
    const subWriter = fs.createWriteStream(subtitlePath);
    subRes.data.pipe(subWriter);

    subWriter.on('finish', async () => {
      await robin.sendMessage(from, {
        document: fs.readFileSync(subtitlePath),
        mimetype: 'application/zip',
        fileName: `${q}-subs.zip`,
        caption: `📄 Sinhala Subtitle for *${q}*`,
        quoted: mek
      });
      fs.unlinkSync(subtitlePath);
    });

    // Send video link as message (direct download is risky for large files)
    await robin.sendMessage(from, {
      text: `🎬 *${q}* Movie Video Link:\n${videoLink}\n\n📄 Subtitle will be sent shortly.`,
      quoted: mek
    });

  } catch (err) {
    console.error(err);
    await reply("❌ Error occurred while processing your request.");
  }
});
