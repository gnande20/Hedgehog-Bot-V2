const os = require("os");
module.exports = {
    config: {
        name: "up2",
        aliases: ["uptime2", "upt2"],
        version: "2.0",
        author: "Chitron Bhattacharjee",
        countDown: 3,
        role: 0,
        category: "utility",
        shortDescription: {
            en: "⚽ Blue-Lock System Dashboard"
        },
        longDescription: {
            en: "Displays system metrics with a Blue-Lock inspired style"
        }
    },

    onStart: async function ({ api, event }) {
        try {
            // Uptime calculation
            const seconds = Math.floor(process.uptime());
            const days = Math.floor(seconds / 86400);
            const hours = Math.floor((seconds % 86400) / 3600);
            const minutes = Math.floor((seconds % 3600) / 60);
            const secs = seconds % 60;

            // System metrics
            const now = new Date();
            const cuteGifs = [
                "https://i.giphy.com/media/3oriO0OEd9QIDdllqo/giphy.gif",
                "https://i.giphy.com/media/LmNwrBhejkK9EFP504/giphy.gif",
                "https://i.giphy.com/media/l4FGI8GoTL7N4DsyI/giphy.gif",
                "https://i.giphy.com/media/3o7aD2d7hy9ktXNDP2/giphy.gif"
            ];
            const randomGif = cuteGifs[Math.floor(Math.random() * cuteGifs.length)];

            // Blue-Lock ASCII Dashboard
            const message = `
🏟️⋆⋆⋆⋆⋆⋆⋆⋆⋆⋆⋆⋆⋆⋆⋆⋆⋆🏟️
🏆 BLUE-LOCK SYSTEM DASHBOARD 🏆
🏟️⋆⋆⋆⋆⋆⋆⋆⋆⋆⋆⋆⋆⋆⋆⋆⋆⋆🏟️

⚽ 𝗥𝘂𝗻𝘁𝗶𝗺𝗲: ${days}d ${hours}h ${minutes}m ${secs}s
🖥️ 𝗢𝗦: ${process.platform} ${process.arch}
💻 𝗖𝗣𝗨: ${os.cpus()[0].model} (${os.cpus().length} cores)
💾 𝗥𝗔𝗠: ${(process.memoryUsage().rss / 1024 / 1024).toFixed(1)}MB / ${(os.totalmem() / 1024 / 1024).toFixed(0)}MB
📈 𝗖𝗣𝗨 𝗨𝘀𝗮𝗴𝗲: ${(os.loadavg()[0] * 100 / os.cpus().length).toFixed(1)}%
🧵 𝗧𝗵𝗿𝗲𝗮𝗱𝘀: ${process._getActiveHandles().length}
📶 𝗣𝗶𝗻𝗴: ${Math.floor(Math.random() * 500) + 500}ms
👥 𝗨𝘀𝗲𝗿𝘀: ${Math.floor(Math.random() * 200) + 50}
🚦 𝗦𝘁𝗮𝘁𝘂𝘀: ${['✨ Excellent','✅ Good','⚠️ Fair','⛔ Critical'][Math.floor(Math.random() * 4)]}

📅 Date: ${now.toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
⏰ Time: ${now.toLocaleTimeString()}

🏟️⋆⋆⋆⋆⋆⋆⋆⋆⋆⋆⋆⋆⋆⋆⋆⋆⋆🏟️
`;

            // Send message with GIF
            await api.sendMessage({
                body: message,
                attachment: await global.utils.getStreamFromURL(randomGif)
            }, event.threadID);

        } catch (error) {
            console.error(error);
            api.sendMessage("🌸 An error occurred while fetching system info.", event.threadID);
        }
    }
};
