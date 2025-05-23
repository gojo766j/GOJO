const axios = require("axios");
const cheerio = require("cheerio");

async function getMovieByName(query) {
    const url = `https://sinhalasub.lk/?s=${encodeURIComponent(query)}`;
    const res = await axios.get(url);
    const $ = cheerio.load(res.data);
    const posts = $(".post");

    const movies = [];

    posts.each((i, el) => {
        const title = $(el).find(".post-title").text().trim();
        const link = $(el).find("a").attr("href");
        if (title && link) {
            movies.push({ title, link });
        }
    });

    return movies;
}

module.exports = { getMovieByName };
