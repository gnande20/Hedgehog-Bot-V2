const Canvas = require("canvas");
Canvas.registerFont(`${__dirname}/assets/font/BeVietnamPro-Bold.ttf`, { family: "BeVietnamPro-Bold" });

module.exports = {
    config: {
        name: "help",
        aliases: ["h", "cmds"],
        version: "1.0",
        author: "Camille",
        countDown: 3,
        role: 0,
        description: {
            vi: "Hiển thị tất cả các lệnh của bot",
            en: "Show all available bot commands"
        },
        category: "system"
    },

    onStart: async function({ message, envCommands }) {
        const prefix = global.GoatBot.prefix || ".";
        let categories = {};

        // Grouper les commandes par catégorie
        for (const cmdName in envCommands) {
            const cmd = envCommands[cmdName];
            const cat = cmd.config.category || "Other";
            if (!categories[cat]) categories[cat] = [];
            categories[cat].push(`${prefix}${cmd.config.name} - ${cmd.config.description.en}`);
        }

        // Canvas
        const width = 1200;
        const height = 600;
        const canvas = Canvas.createCanvas(width, height);
        const ctx = canvas.getContext("2d");

        // Dégradé style Blue Lock
        const gradient = ctx.createLinearGradient(0, 0, width, height);
        gradient.addColorStop(0, "#0f0f0f");
        gradient.addColorStop(1, "#1b1b1b");
        ctx.fillStyle = gradient;
        ctx.fillRect(0, 0, width, height);

        // Carreaux
        const size = 60;
        ctx.strokeStyle = "#2e2e2e";
        ctx.lineWidth = 2;
        for (let x = 0; x < width; x += size) {
            for (let y = 0; y < height; y += size) {
                ctx.strokeRect(x, y, size, size);
            }
        }

        // Fonction pour néon
        function drawNeonText(text, x, y, color = "#00ffff", glow = 20, font = "bold 60px BeVietnamPro-Bold") {
            ctx.font = font;
            ctx.textAlign = "center";
            ctx.fillStyle = color;
            ctx.shadowColor = color;
            ctx.shadowBlur = glow;
            ctx.fillText(text, x, y);
            ctx.shadowBlur = 0; // reset
        }

        // Titre avec néon
        drawNeonText("📜 Commandes du Bot", width / 2, 70, "#00ffff", 25, "bold 60px BeVietnamPro-Bold");
        drawNeonText("⚽ Blue Lock Style by Camille", width / 2, 110, "#ff6a00", 15, "bold 30px BeVietnamPro-Bold");

        // Liste des commandes
        ctx.font = "28px BeVietnamPro-Bold";
        ctx.textAlign = "left";
        let startY = 150;

        for (const cat in categories) {
            // Catégorie en néon jaune
            drawNeonText(categories[cat][0] ? `📂 ${cat.toUpperCase()}` : cat.toUpperCase(), 50, startY, "#ffcb05", 15, "bold 32px BeVietnamPro-Bold");
            startY += 40;

            for (const cmdText of categories[cat]) {
                if (startY > height - 50) {
                    ctx.fillStyle = "#ffffff";
                    ctx.fillText("...et plus", 80, startY);
                    startY += 30;
                    break;
                }
                // Commandes en blanc avec léger glow
                drawNeonText(`- ${cmdText}`, 80, startY, "#ffffff", 5, "28px BeVietnamPro-Bold");
                startY += 30;
            }

            startY += 20;
        }

        return message.reply({
            attachment: canvas.toBuffer()
        });
    }
};
