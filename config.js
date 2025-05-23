const fs = require("fs");
if (fs.existsSync("config.env"))
  require("dotenv").config({ path: "./config.env" });

function convertToBool(text, fault = "true") {
  return text === fault ? true : false;
}
module.exports = {
  SESSION_ID: process.env.SESSION_ID || "V3dTHCQJ#-LvaDvnuhGqSt2t5SpAYLN6Kt7C4Xx2qMZCYJGMpWlY",
  OWNER_NUM: process.env.OWNER_NUM || "94743826406",
  PREFIX: process.env.PREFIX || ".",
  AUTO_READ_STATUS: process.env.AUTO_READ_STATUS || "true",
  MODE: process.env.MODE || "public",
  AUTO_VOICE: process.env.AUTO_VOICE || "true",
  AUTO_STICKER: process.env.AUTO_STICKER || "true",
  AUTO_REPLY: process.env.AUTO_REPLY || "true",
  MOVIE_API_KEY: process.env.MOVIE_API_KEY || "d95f8f85f76de495cd4dd25cde7eb200",
  GEMINI_API_KEY: process.env.GEMINI_API_KEY || "AIzaSyA0NiCkktrT973oiXlmXBOJUXnlkvbXiA0",

};
