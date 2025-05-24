const { cmd } = require('../command');
const axios = require('axios');
const fs = require('fs-extra');
const path = require('path');
const cheerio = require('cheerio');

cmd({
  pattern: "movie",
  category: "download",
  react: '🎬',
  desc: "Download movie and Sinhala subtitles from SinhalaSub.lk",
  filename: __filename
}, async (robin, m, mek, { from, q, reply }) => {
  if (!q) return reply("❌ Please provide a movie name (e.g., .movie Deadpool)");

  try {
    // 1. Search movie on SinhalaSub.lk
    const searchUrl = `https://www.sinhalasub.lk/?s=${encodeURIComponent(q)}`;
    const searchRes = await axios.get(searchUrl);
    const $ = cheerio.load(searchRes.data);
    const movieLink = $('.post-title a').attr('href');

    if (!movieLink) return reply("❌ Movie not found on SinhalaSub.lk");

    // 2. Scrape movie page for download links
    const pageRes = await axios.get(movieLink);
    const $$ = cheerio.load(pageRes.data);

    // Try to find direct movie file (you may need to inspect for valid selector)
    const videoLink = $$("a[href*='mega.nz'], a[href*='gofile.io'], a[href*='mediafire.com']").first().attr('href');
    const subtitleLink = $$("a[href$='.zip'], a[href$='.srt']").first().attr('href');

    if (!videoLink || !subtitleLink) {
      return reply("❌ Couldn't find video or subtitle links.");
    }

    await reply("⬇️ Downloading movie...");

    // Download Movie
    const videoPath = path.join(__dirname, `${q}-movie.mp4`);
    const videoResp = await axios({ url: videoLink, method: 'GET', responseType: 'stream' });
    const videoWriter = fs.createWriteStream(videoPath);
    videoResp.data.pipe(videoWriter);
    await new Promise(res => videoWriter.on('finish', res));

    await robin.sendMessage(from, {
      document: fs.readFileSync(videoPath),
      mimetype: 'video/mp4',
      fileName: `${q}.mp4`,
      caption: `🎬 *${q}* Movie File`,
      quoted: mek
    });
    fs.unlinkSync(videoPath);

    // Download Subtitle
    await reply("⬇️ Downloading subtitles...");
    const subPath = path.join(__dirname, `${q}-subs.zip`);
    const subResp = await axios({ url: subtitleLink, method: 'GET', responseType: 'stream' });
    const subWriter = fs.createWriteStream(subPath);
    subResp.data.pipe(subWriter);
    await new Promise(res => subWriter.on('finish', res));

    await robin.sendMessage(from, {
      document: fs.readFileSync(subPath),
      mimetype: 'application/zip',
      fileName: `${q}-subs.zip`,
      caption: `📄 Sinhala Subtitle for *${q}*`,
      quoted: mek
    });
    fs.unlinkSync(subPath);

  } catch (err) {
    console.error(err);
    reply("❌ Error occurred while downloading the movie or subtitles.");
  }
});
