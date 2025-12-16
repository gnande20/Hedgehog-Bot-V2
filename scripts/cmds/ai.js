const axios = require("axios");

// ================= UTILITAIRE API =================
async function fetchFromAI(url, params) {
  try {
    const response = await axios.get(url, {
      params,
      timeout: 20000
    });
    return response.data;
  } catch (error) {
    console.error("Erreur API :", error.message);
    return null;
  }
}

async function getAIResponse(input, userName) {
  const services = [
    {
      url: "https://arychauhann.onrender.com/api/gemini-proxy2",
      params: {
        prompt: `Tu es Kyo Soma (Fruits Basket).
Impulsif, franc, parfois agressif mais sincère.
Ne dis jamais que tu es une IA.

${userName} : ${input}`
      }
    },
    {
      url: "https://ai-chat-gpt-4-lite.onrender.com/api/hercai",
      params: {
        question: `Réponds comme Kyo Soma.
${userName} : ${input}`
      }
    }
  ];

  let response =
    "😾 Kyo Soma :\n\nTch… les serveurs répondent pas. Reviens plus tard.";

  for (const service of services) {
    const data = await fetchFromAI(service.url, service.params);
    if (data) {
      const reply =
        data.result || data.reply || data.gpt4 || data.response;
      if (reply && reply.trim()) {
        response = reply;
        break;
      }
    }
  }

  return response;
}

// ================= REGEX CRÉATEUR =================
const creatorRegex =
  /(qui\s+(t'?a|t’a)\s+cr(é|e)é|ton\s+cr(é|e)ateur|qui\s+ta\s+fait|qui\s+est\s+ton\s+createur)/i;

// ================= MODULE GOATBOT =================
module.exports = {
  config: {
    name: "ai",
    aliases: ["aesther", "ae", "jokers"],
    author: "Samycharles (mod Kyo Soma)",
    role: 0,
    category: "ai",
    shortDescription: "Parler avec Kyo Soma sans préfixe",
    guide: {
      fr: "ai <question> ou commence par ai / ae / jokers"
    }
  },

  // ========= AVEC PRÉFIXE =========
  onStart: async function ({ api, event, args }) {
    const input = args.join(" ").trim();
    if (!input) {
      return api.sendMessage(
        "😾 Kyo Soma :\n\nT’as un problème ? Pose ta question.",
        event.threadID,
        event.messageID
      );
    }

    // 🔥 RÉPONSE CRÉATEUR
    if (creatorRegex.test(input)) {
      return api.sendMessage(
        "😾 Kyo Soma :\n\nTss… pose pas trop de questions.\nC’est **Kyo Soma**, mon créateur.",
        event.threadID,
        event.messageID
      );
    }

    api.getUserInfo(event.senderID, async (err, ret) => {
      if (err) return;
      const userName = ret[event.senderID]?.name || "toi";

      api.setMessageReaction("⏳", event.messageID, () => {}, true);

      const response = await getAIResponse(input, userName);

      api.sendMessage(
        `😾 Kyo Soma :\n\n${response}`,
        event.threadID,
        event.messageID,
        () => api.setMessageReaction("✅", event.messageID, () => {}, true)
      );
    });
  },

  // ========= SANS PRÉFIXE =========
  onChat: async function ({ api, event, message }) {
    if (!event.body) return;

    const match = event.body.match(/^(ai|aesther|ae|jokers)\s+(.*)/i);
    if (!match) return;

    const input = match[2].trim();
    if (!input) return;

    // 🔥 RÉPONSE CRÉATEUR
    if (creatorRegex.test(input)) {
      return message.reply(
        "😾 Kyo Soma :\n\nTss… pose pas trop de questions.\nC’est **Kyo Soma**, mon créateur."
      );
    }

    api.getUserInfo(event.senderID, async (err, ret) => {
      if (err) return;
      const userName = ret[event.senderID]?.name || "toi";

      api.setMessageReaction("⏳", event.messageID, () => {}, true);

      const response = await getAIResponse(input, userName);

      message.reply(`😾 Kyo Soma :\n\n${response}`, () =>
        api.setMessageReaction("✅", event.messageID, () => {}, true)
      );
    });
  }
};
