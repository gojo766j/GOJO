module.exports = {
  pattern: "mv",
  alias: ["film", "sinhala"],
  desc: "Search Sinhala Sub Movies",
  react: "🎬",
  category: "movie",
  use: ".movie <movie name>",

  async function(robin, m, { args, reply }) {
    if (!args[0]) return reply("Movie name එකක් දෙන්න. උදා: `.movie Interstellar`");

    try {
      const searchTerm = args.join(" ");
      const searchRes = await fetch(`https://suhas-bro-api.vercel.app/movie/sinhalasub/search?text=${encodeURIComponent(searchTerm)}`);
      const searchData = await searchRes.json();

      if (!searchData || searchData.length === 0) {
        return reply("Movie එකක් හමුවුනෙ නැහැ.");
      }

      const movie = searchData[0];
      const detailRes = await fetch(`https://suhas-bro-api.vercel.app/movie/sinhalasub/movie?url=${movie.url}`);
      const details = await detailRes.json();

      let caption = `🎬 *Title:* ${movie.title}\n`;
      caption += `🗓 *Year:* ${details?.year || "Unknown"}\n`;
      caption += `📺 *Genre:* ${details?.genre || "N/A"}\n`;
      caption += `🧾 *Plot:* ${details?.plot || "No description."}\n`;
      caption += `📄 *Subtitle:* ${details?.subtitle || "Not Available"}\n`;

      await robin.sendMessage(m.from, {
        image: { url: movie.image },
        caption: caption
      }, { quoted: m });
    } catch (e) {
      console.log("Movie Plugin Error:", e);
      reply("Error එකක් තිබුණා. පුළුවන් නම් පසුව නැවත උත්සහ කරන්න.");
    }
  }
};
