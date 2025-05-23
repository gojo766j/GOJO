const axios = require('axios');
const cheerio = require('cheerio');

async function getMovies() {
  try {
    const { data } = await axios.get('https://sinhalasub.lk/');
    const $ = cheerio.load(data);
    const movies = [];

    $('.ml-item').each((i, el) => {
      const title = $(el).find('.mli-info h2').text().trim();
      const quality = $(el).find('.mli-quality').text().trim();
      const link = $(el).find('a').attr('href');
      if (title && link) {
        movies.push({ title, quality, link });
      }
    });

    return movies;
  } catch (err) {
    console.error('Scraping error:', err.message);
    return [];
  }
}

module.exports = { getMovies };
