const { cmd } = require("../command");
const axios = require("axios");

cmd({
  pattern: "apk",
  react: "📦",
  desc: "Download APK by app name",
  category: "download",
  filename: __filename,
}, async (conn, m, store, { from, q, reply }) => {
  try {
    if (!q) return reply("❌ App එකේ නමක් එවන්න (`.apk <app name>`)");

    await conn.sendMessage(from, { react: { text: "⏳", key: m.key } });

    const searchUrl = `https://ws75.aptoide.com/api/7/apps/search/?q=${encodeURIComponent(q)}&limit=1`;

    const searchRes = await axios.get(searchUrl);
    const appData = searchRes.data?.datalist?.list?.[0];

    if (!appData) {
      return reply("⚠️ App එකක් හමු නොවීය. වෙනත් නමක් try කරන්න.");
    }

    const downloadUrl = appData?.file?.path_alt;
    if (!downloadUrl) return reply("❌ Download link එකක් හමු නොවුණා.");

    const appSize = (appData.size / 1024 / 1024).toFixed(2); // MB

    const caption = `*「 APK Downloader 」*

🏷️ *Name:* ${appData.name}
📦 *Package:* ${appData.package}
📏 *Size:* ${appSize} MB
📆 *Updated:* ${appData.added}
👨‍💻 *Developer:* ${appData.developer?.name || "Unknown"}

✅ *Download link available!*`;

    await conn.sendMessage(from, {
      document: { url: downloadUrl },
      fileName: `${appData.name}.apk`,
      mimetype: "application/vnd.android.package-archive",
      caption
    }, { quoted: m });

    await conn.sendMessage(from, { react: { text: "✅", key: m.key } });

  } catch (err) {
    console.error(err);
    reply("❌ App එක ලබා ගැනීමේදී දෝෂයක් ඇතිවිය.");
  }
});
