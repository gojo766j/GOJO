// File: plugins/movie.js const { getMovies } = require("../scraper");

module.exports = { pattern: "movie", alias: ["film", "movies"], desc: "Get SinhalaSub.lk movies", category: "media", react: "\uD83C\uDFAC", use: '.movie <search term>', filename: __filename,

function: async ( sock, m, { args, q, from, reply } ) => { if (!q) return reply("Please provide a movie name. Eg: .movie John Wick");

const movies = await getMovies();
const filtered = movies.filter(movie =>
  movie.title.toLowerCase().includes(q.toLowerCase())
);

if (filtered.length === 0) return reply("No results found.");

let text = "*Found Movies:*\n\n";
filtered.forEach((movie, i) => {
  text += `${i + 1}. *${movie.title}*\nQuality: ${movie.quality || "Unknown"}\nLink: ${movie.link}\n\n`;
});

return reply(text.trim());

}, };

