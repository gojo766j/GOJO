const {
  default: makeWASocket,
  useMultiFileAuthState,
  DisconnectReason,
  jidNormalizedUser,
  getContentType,
  fetchLatestBaileysVersion,
  Browsers,
} = require("@whiskeysockets/baileys");

const fs = require("fs");
const P = require("pino");
const path = require("path");
const axios = require("axios");
const qrcode = require("qrcode-terminal");

const config = require("./config");
const prefix = config.PREFIX;
const ownerNumber = config.OWNER_NUM;

const { sms, getBuffer, getGroupAdmins } = require("./lib/functions");
const { commands } = require("./command"); // command registry

const express = require("express");
const app = express();
const port = process.env.PORT || 8000;

// ================== CONNECT TO WHATSAPP ===================

async function connectToWA() {
  console.log("Connecting Gojo max...");

  const { state, saveCreds } = await useMultiFileAuthState(
    path.join(__dirname, "auth_info_baileys")
  );

  const { version } = await fetchLatestBaileysVersion();

  const sock = makeWASocket({
    logger: P({ level: "silent" }),
    printQRInTerminal: true,
    auth: state,
    browser: Browsers.macOS("Firefox"),
    version,
  });

  sock.ev.on("connection.update", (update) => {
    const { connection, lastDisconnect, qr } = update;

    if (qr) {
      qrcode.generate(qr, { small: true });
    }

    if (connection === "close") {
      const statusCode = lastDisconnect?.error?.output?.statusCode || 0;
      console.log("Disconnected with status code:", statusCode);
      if (statusCode !== DisconnectReason.loggedOut) {
        console.log("Reconnecting...");
        connectToWA();
      } else {
        console.log("Logged out, please delete session and restart.");
      }
    } else if (connection === "open") {
      console.log("Connected to WhatsApp ✅");

      // Send welcome message to owner
      const msg = "Gojo max connected successful ✅";
      sock.sendMessage(ownerNumber + "@s.whatsapp.net", {
        text: msg,
      });
    }
  });

  sock.ev.on("creds.update", saveCreds);

  // ========== LOAD ALL PLUGINS =============
  fs.readdirSync("./plugins/")
    .filter((file) => file.endsWith(".js"))
    .forEach((file) => {
      try {
        require(path.join(__dirname, "plugins", file));
      } catch (err) {
        console.error("Error loading plugin", file, err);
      }
    });

  // ========== MESSAGE HANDLER ===============
  sock.ev.on("messages.upsert", async (msgUpsert) => {
    if (!msgUpsert.messages) return;
    const mek = msgUpsert.messages[0];
    if (!mek.message) return;

    // Unwrap ephemeral messages if any
    mek.message =
      getContentType(mek.message) === "ephemeralMessage"
        ? mek.message.ephemeralMessage.message
        : mek.message;

    // Ignore status broadcast
    if (mek.key.remoteJid === "status@broadcast") return;

    const m = sms(sock, mek);
    const from = mek.key.remoteJid;
    const type = getContentType(mek.message);

    let body = "";
    if (type === "conversation") {
      body = mek.message.conversation || "";
    } else if (type === "extendedTextMessage") {
      body = mek.message.extendedTextMessage.text || "";
    } else if (type === "imageMessage") {
      body = mek.message.imageMessage.caption || "";
    } else if (type === "videoMessage") {
      body = mek.message.videoMessage.caption || "";
    }

    if (!body.startsWith(prefix)) return; // Ignore non-commands

    const isCmd = true;
    const commandName = body.slice(prefix.length).trim().split(" ")[0].toLowerCase();
    const args = body.trim().split(" ").slice(1);
    const q = args.join(" ");

    // Sender info
    const sender = mek.key.fromMe
      ? sock.user.id.split(":")[0] + "@s.whatsapp.net"
      : mek.key.participant || mek.key.remoteJid;
    const senderNumber = sender.split("@")[0];
    const isOwner = ownerNumber.includes(senderNumber);

    // Command lookup
    const cmd =
      commands.find((c) => c.pattern === commandName) ||
      commands.find((c) => c.alias && c.alias.includes(commandName));

    if (!cmd) return;

    if (cmd.react) {
      await sock.sendMessage(from, {
        react: { text: cmd.react, key: mek.key },
      });
    }

    try {
      await cmd.function(sock, mek, m, {
        from,
        q,
        args,
        command: commandName,
        reply: async (text) => {
          await sock.sendMessage(from, { text }, { quoted: mek });
        },
      });
    } catch (error) {
      console.error("Plugin error:", error);
      await sock.sendMessage(from, { text: "❌ දෝෂයක් සිදු විය!" }, { quoted: mek });
    }
  });
}

// Express server (optional)
app.get("/", (req, res) => {
  res.send("Gojo max started ✅");
});

app.listen(port, () => {
  console.log(`Server running on http://localhost:${port}`);
});

// Start bot
connectToWA();
