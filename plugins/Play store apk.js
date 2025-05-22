const axios = require("axios");

cmd({
  pattern: "app",
  react: "📦",
  desc: "Download APK from Aptoide using app name.",
  category: "download",
  filename: __filename
}, async (conn, m, store, { from, q, reply }) => {
  try {
    if (!q) return reply("❌ App එකේ නමක් එවන්න (`.apk <app name>`)");

    await conn.sendMessage(from, { react: { text: "⏳", key: m.key } });

    const apiUrl = `http://ws75.aptoide.com/api/7/apps/search/query=${encodeURIComponent(q)}/limit=1`;
    const response = await axios.get(apiUrl);
    const data = response.data;

    if (!data?.datalist?.list?.length) {
      return reply("⚠️ App එකක් හමු නොවීය.");
    }

    const app = data.datalist.list[0];
    const downloadLink = app.file?.path_alt;

    if (!downloadLink) {
      return reply("❌ මේ app එකට download link එකක් නොමැත.");
    }

    const appSizeMB = app.size ? (app.size / 1048576).toFixed(2) : "Unknown";

    const caption = `*「 APK Downloader 」*
    
🏷️ *Name:* ${app.name}
📦 *Package:* ${app.package}
📏 *Size:* ${appSizeMB} MB
📆 *Updated:* ${app.updated}
👨‍💻 *Developer:* ${app.developer?.name || "Unknown"}

✅ Download එක සාර්ථකයි!`;

    await conn.sendMessage(from, {
      document: { url: downloadLink },
      fileName: `${app.name}.apk`,
      mimetype: "application/vnd.android.package-archive",
      caption
    }, { quoted: m });

    await conn.sendMessage(from, { react: { text: "✅", key: m.key } });

  } catch (err) {
    console.error("APK Error:", err);
    reply("❌ App එක ලබා ගැනීමේදී දෝෂයක් ඇතිවිය.");
  }
});
