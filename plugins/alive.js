const { cmd } = require('../command');
const config = require('../config');
cmd({
    pattern: "alive",
    alias: "bot",
    react: "👻",
    desc: "Check if Gojo bot is online.",
    category: "main",
    filename: __filename
}, async (gojo, mek, m, {
    from, reply
}) => {
    try {
        // Send image + caption
        await gojo.sendMessage(from, {
            image: { url: "https://raw.githubusercontent.com/Gojo899/Bot-photo-and-video-/refs/heads/main/Photo/file_00000000d0dc61f597f450261ecfe33f%20(1).png" },
            caption: `⚡ GOJO MAX is ALIVE ⚡\n\nSystem Status: ONLINE ✅\nBot Power Level: ∞\n\nCreated & Managed by: sayura\n\nType .menu to explore commands!`
        }, { quoted: mek });

        // Send voice message (PTT style)
        await gojo.sendMessage(from, {
            audio: {
                url: "https://github.com/Gojo899/Bot-photo-and-video-/raw/refs/heads/main/mp3/1747630063493150813rf60n6vl-voicemaker.in-speech.mp3"
            },
            mimetype: 'audio/mpeg',
            ptt: true
        }, { quoted: mek });

    } catch (e) {
        console.log(e);
        reply("Error in .alive command:\n" + e);
    }
});
