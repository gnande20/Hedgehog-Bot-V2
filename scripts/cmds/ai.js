const axios = require("axios");

// ================= API =================
async function fetchFromAI(url, params) {
  try {
    const res = await axios.get(url, {
      params,
      timeout: 20000
    });
    return res.data;
  } catch (e) {
    console.error("API error:", e.message);
    return null;
  }
}

async function getAIResponse(input, userName) {
  const services = [
    {
      url: "https://arychauhann.onrender.com/api/gemini-proxy2",
      params: {
        prompt: `Tu es une IA créé par Kyo Soma.

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
    "😾 Kyo Soma :\n\nTch… les serveurs sont morts. Reviens plus tard.";

  for (const s of services) {
    const data = await fetchFromAI(s.url, s.params);
    if (!data) continue;

    const reply = data.result || data.reply || data.gpt4 || data.response;
    if (reply && reply.trim()) {
      response = reply;
      break;
    }
  }

  return response;
}

// ================= REGEX =================
const creatorRegex =
  /(qui\s+(t'?a|t’a)\s+cr(é|e)é|ton\s+cr(é|e)ateur|qui\s+ta\s+fait|qui\s+est\s+ton\s+createur)/i;

// ================= MODULE =================
module.exports = {
  config: {
    name: "kyosoma",
    aliases: ["kyo soma", "kyo"],
    author: "Samycharles (Kyo Soma mode)",
    role: 0,
    category: "ai",
    shortDescription: "Parler avec Kyo Soma",
    guide: {
      fr: "Kyo Soma <question>"
    }
  },

  // ===== AVEC PRÉFIXE =====
  onStart: async function ({ api, event, args }) {
    const input = args.join(" ").trim();
    if (!input) {
      return api.sendMessage(
        "😾 Kyo Soma :\n\nQuoi ? Parle.",
        event.threadID,
        event.messageID
      );
    }
    
    api.getUserInfo(event.senderID, async (err, data) => {
      if (err) return;
      const userName = data[event.senderID]?.name || "toi";

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

  // ===== SANS PRÉFIXE =====
  onChat: async function ({ api, event, message }) {
    if (!event.body) return;

    const body = event.body.trim();

    // ❌ Bloque totalement "ai"
    if (/^ai\b/i.test(body)) return;

    // 👀 Si on dit seulement "Kyo Soma"
    if (/^kyo\s+soma$/i.test(body)) {
      return message.reply(
        "😾 Kyo Soma :\n\nTch… quoi encore ?"
      );
    }

    // 🔑 Déclencheur Kyo Soma
    const match = body.match(/^(kyo\s+soma|kyo)\s+(.*)/i);
    if (!match) return;

    const input = match[2].trim();
    if (!input) return;
    
    api.getUserInfo(event.senderID, async (err, data) => {
      if (err) return;
      const userName = data[event.senderID]?.name || "toi";

      api.setMessageReaction("⏳", event.messageID, () => {}, true);
      const response = await getAIResponse(input, userName);

      message.reply(
        `😾 Kyo Soma :\n\n${response}`,
        () => api.setMessageReaction("✅", event.messageID, () => {}, true)
      );
    });
  }
};
