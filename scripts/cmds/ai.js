const axios = require("axios");
const fs = require("fs");
const path = require("path");

// 📂 Fichier mémoire persistante
const memoryPath = path.join(__dirname, "ayanokoji_memory.json");

// Charger la mémoire
let memoryDB = fs.existsSync(memoryPath)
  ? JSON.parse(fs.readFileSync(memoryPath, "utf8"))
  : {};

// Sauvegarde mémoire
function saveMemory() {
  fs.writeFileSync(memoryPath, JSON.stringify(memoryDB, null, 2));
}

// --- Appel API ---
async function fetchFromAI(url, params) {
  try {
    const res = await axios.get(url, { params, timeout: 60000 });
    return res.data;
  } catch (e) {
    console.error("API error:", e.message);
    return null;
  }
}

// --- Réponse IA ---
async function getAIResponse(input, userId, userName) {
  if (!memoryDB[userId]) {
    memoryDB[userId] = {
      history: [],
      mode: "normal"
    };
  }

  const userData = memoryDB[userId];

  userData.history.push(input);
  if (userData.history.length > 10) userData.history.shift();

  saveMemory();

  const personality =
    userData.mode === "manipulateur"
      ? `Tu es Kiyotaka Ayanokōji en mode manipulateur.
Tu es calme, stratégique, psychologique, jamais agressif.
Tu analyses l'utilisateur et influences subtilement ses décisions.`
      : `Tu es Kiyotaka Ayanokōji.
Tu es respectueux, calme, analytique, intelligent et posé aussi une IA créé par Testsuya Kuroko.`;

  const context = `
${personality}

Nom utilisateur : ${userName}
Historique récent :
${userData.history.map((h, i) => `${i + 1}. ${h}`).join("\n")}

Question actuelle : ${input}
`;

  const services = [
    {
      url: "https://arychauhann.onrender.com/api/gemini-proxy2",
      params: { prompt: context }
    },
    {
      url: "https://ai-chat-gpt-4-lite.onrender.com/api/hercai",
      params: { question: context }
    }
  ];

  for (const s of services) {
    const data = await fetchFromAI(s.url, s.params);
    const reply = data?.result || data?.reply || data?.gpt4 || data?.response;
    if (reply && reply.trim()) return reply;
  }

  return "Je n’ai pas assez d’informations pour répondre.";
}

// --- MODULE ---
module.exports = {
  config: {
    name: "ayanokoji",
    aliases: ["ayanokoji", "kiyotaka"],
    author: "Testsuya Kuroko",
    role: 0,
    category: "ai",
    shortDescription: "Kiyotaka Ayanokōji — IA stratégique avec mémoire",
    guide: {
      fr: "Ayanokoji <question> | Ayanokoji mode manipulateur"
    }
  },

  onChat: async function ({ api, event, message }) {
    if (!event.body) return;
    const content = event.body.trim();

    // Appel simple
    if (/^(ayanokoji|kiyotaka)$/i.test(content)) {
      return message.reply(
        "❮ Kiyotaka Ayanokōji ❯\n\nJe suis présent. Parle."
      );
    }

    // Commandes mode
    if (/^ayanokoji mode manipulateur$/i.test(content)) {
      if (!memoryDB[event.senderID]) memoryDB[event.senderID] = { history: [], mode: "normal" };
      memoryDB[event.senderID].mode = "manipulateur";
      saveMemory();
      return message.reply("🕶️ Mode manipulateur activé.");
    }

    if (/^ayanokoji mode normal$/i.test(content)) {
      if (!memoryDB[event.senderID]) memoryDB[event.senderID] = { history: [], mode: "normal" };
      memoryDB[event.senderID].mode = "normal";
      saveMemory();
      return message.reply("🤍 Mode normal activé.");
    }

    // Question
    const match = content.match(/^(ayanokoji|kiyotaka)\s+(.*)/i);
    if (!match) return;

    const input = match[2].trim();
    if (!input) return;

    api.getUserInfo(event.senderID, async (err, ret) => {
      if (err) return;

      const userName = ret[event.senderID]?.name || "Utilisateur";

      api.setMessageReaction("⏳", event.messageID, () => {}, true);

      const response = await getAIResponse(input, event.senderID, userName);

      message.reply(
        `✨━━━━━━━━━━━✨
❮ Kiyotaka Ayanokōji ❯

${response}

✨━━━━━━━━━━━✨`,
        (e) => {
          api.setMessageReaction(e ? "❌" : "✅", event.messageID, () => {}, true);
        }
      );
    });
  }
};
