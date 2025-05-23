const axios = require("axios");
const cheerio = require("cheerio");

async function getMovieByName(query) {
    try {
        const url = `https://sinhalasub.lk/?s=${encodeURIComponent(query)}`;
        const res = await axios.get(url);
        const $ = cheerio.load(res.data);
        const movies = [];

        $(".post").each((i, el) => {
            const title = $(el).find(".post-title").text().trim();
            const link = $(el).find("a").attr("href");
            if (title && link) {
                movies.push({ title, link });
            }
        });

        return movies;
    } catch (err) {
        console.error("Scraper error:", err.message);
        return [];
    }
}

module.exports = { getMovieByName };
