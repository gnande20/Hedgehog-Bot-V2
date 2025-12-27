const axios = require("axios");
const fs = require("fs");
const path = require("path");

module.exports = {
    config: {
        name: "setavt",
        aliases: ["changeavt", "setavatar"],
        version: "1.5",
        author: "NTKhang",
        countDown: 5,
        role: 2,
        description: {
            vi: "Đổi avatar bot (tự động lấy ảnh gửi kèm hoặc phản hồi)",
            en: "Change bot avatar (auto uses attached or replied image)"
        },
        category: "owner",
        guide: {
            vi: "{pn} [<image url>] [<caption>] [<expirationAfter(seconds)>]\n"
                + "Bạn có thể gửi kèm ảnh hoặc trả lời ảnh với lệnh này.\n"
                + "Ví dụ:\n"
                + "  {pn} https://example.com/image.jpg Hello 3600"
        }
    },

    langs: {
        vi: {
            cannotGetImage: "❌ | Không thể tải hình ảnh",
            invalidImageFormat: "❌ | Định dạng ảnh không hợp lệ",
            changedAvatar: "✅ | Đã đổi avatar thành công"
        },
        en: {
            cannotGetImage: "❌ | Cannot fetch image",
            invalidImageFormat: "❌ | Invalid image format",
            changedAvatar: "✅ | Changed avatar successfully"
        }
    },

    onStart: async function ({ message, event, api, args, getLang }) {
        try {
            // Récupérer l'image : URL ou attachée au message ou réponse
            const imageURL = (args[0] || "").startsWith("http") ? args.shift() 
                : event.attachments?.[0]?.url 
                || event.messageReply?.attachments?.[0]?.url;

            if (!imageURL) return message.SyntaxError();

            const expirationAfter = !isNaN(args[args.length - 1]) ? args.pop() : null;
            const caption = args.join(" ");

            // Télécharger l'image
            const response = await axios.get(imageURL, { responseType: "arraybuffer" });
            const contentType = response.headers["content-type"];
            if (!contentType.startsWith("image")) return message.reply(getLang("invalidImageFormat"));

            // Sauvegarder temporairement
            const tempPath = path.join(__dirname, "avatar_temp.jpg");
            fs.writeFileSync(tempPath, Buffer.from(response.data, "binary"));

            // Changer l'avatar
            api.changeAvatar(tempPath, caption, expirationAfter ? expirationAfter * 1000 : null, (err) => {
                // Supprimer le fichier temporaire
                fs.unlinkSync(tempPath);
                if (err) return message.err(err);
                return message.reply(getLang("changedAvatar"));
            });
        } catch (err) {
            return message.reply(getLang("cannotGetImage"));
        }
    }
};
