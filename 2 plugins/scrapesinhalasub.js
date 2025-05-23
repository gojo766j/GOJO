const axios = require("axios");
const cheerio = require("cheerio");

async function getAllMovies() {
  let page = 1;
  const movies = [];

  while (true) {
    const url = `https://sinhalasub.lk/page/${page}/`;
    try {
      const res = await axios.get(url);
      const $ = cheerio.load(res.data);

      const posts = $(".post");
      if (posts.length === 0) break; // No more posts

      posts.each((i, el) => {
        const title = $(el).find(".post-title").text().trim();
        const link = $(el).find("a").attr("href");
        if (title && link) {
          movies.push({ title, link });
        }
      });

      console.log(`Page ${page} scraped`);
      page++;
    } catch (error) {
      console.error("Error fetching page:", error.message);
      break;
    }
  }

  console.log(`\nTotal movies scraped: ${movies.length}`);
  console.log(JSON.stringify(movies, null, 2));
}

getAllMovies();
