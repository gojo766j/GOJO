const { cmd } = require('../command'); const { fetchJson } = require('../lib/functions'); const axios = require('axios'); const fs = require('fs-extra'); const path = require('path');

cmd({ pattern: "movie", category: "download", react: '🎬', desc: "Download movie and Sinhala subtitles from dark-yasiya-sinhalasub.lk", filename: __filename }, async (robin, m, mek, { from, q, reply }) => { if (!q) return reply("❌ Please provide a movie name (e.g., .movie Deadpool)");

try { // Call your own API that uses dark-yasiya-sinhalasub.lk scraper const apiUrl = https://your-node-api.com/movie-info?q=${encodeURIComponent(q)}; const res = await fetchJson(apiUrl);

if (!res || !res.video_link || !res.subtitle_link) {
  return reply("❌ Movie or subtitles not found.");
}

// ==== Download Movie File ====
const videoPath = path.join(__dirname, `${q}-movie.mp4`);
const videoWriter = fs.createWriteStream(videoPath);
const videoResp = await axios({ url: res.video_link, method: 'GET', responseType: 'stream' });

videoResp.data.pipe(videoWriter);

videoWriter.on('finish', async () => {
  await robin.sendMessage(from, {
    document: fs.readFileSync(videoPath),
    mimetype: 'video/mp4',
    fileName: `${q}.mp4`,
    caption: `🎬 *${q}* Movie File`,
    quoted: mek
  });
  fs.unlinkSync(videoPath);
});

// ==== Download Subtitle File ====
const subPath = path.join(__dirname, `${q}-subs.zip`);
const subWriter = fs.createWriteStream(subPath);
const subResp = await axios({ url: res.subtitle_link, method: 'GET', responseType: 'stream' });

subResp.data.pipe(subWriter);

subWriter.on('finish', async () => {
  await robin.sendMessage(from, {
    document: fs.readFileSync(subPath),
    mimetype: 'application/zip',
    fileName: `${q}-subs.zip`,
    caption: `📄 Sinhala Subtitle for *${q}*`,
    quoted: mek
  });
  fs.unlinkSync(subPath);
});

} catch (err) { console.error(err); await reply("❌ Error occurred while fetching the movie or subtitle."); } });

