const axios = require("axios");
const cheerio = require("cheerio");

async function getMovieByName(movieName) {
  const baseUrl = "https://sinhalasub.lk";
  const searchUrl = `${baseUrl}/?s=${encodeURIComponent(movieName)}`;

  try {
    const res = await axios.get(searchUrl);
    const $ = cheerio.load(res.data);

    const results = [];
    $(".post").each((i, el) => {
      const title = $(el).find(".post-title").text().trim();
      const link = $(el).find("a").attr("href");
      if (title.toLowerCase().includes(movieName.toLowerCase())) {
        results.push({ title, link });
      }
    });

    return results;
  } catch (error) {
    console.error("Error fetching movie:", error.message);
    return [];
  }
}

module.exports = { getMovieByName };
