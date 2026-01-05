const axios = require("axios");
const fs = require("fs");
const path = require("path");

const memoryPath = path.join(__dirname, "ayanokoji_memory.json");

let memoryDB = fs.existsSync(memoryPath)
  ? JSON.parse(fs.readFileSync(memoryPath, "utf8"))
  : {};

function saveMemory() {
  fs.writeFileSync(memoryPath, JSON.stringify(memoryDB, null, 2));
}

async function fetchFromAI(url, params) {
  try {
    const res = await axios.get(url, { params, timeout: 60000 });
    return res.data;
  } catch (e) {
    console.error("API error:", e.message);
    return null;
  }
}

async function getAIResponse(input, userId, userName) {
  if (!memoryDB[userId]) {
    memoryDB[userId] = { history: [], mode: "normal" };
  }

  const userData = memoryDB[userId];
  userData.history.push(input);
  if (userData.history.length > 10) userData.history.shift();
  saveMemory();

  const personality =
    userData.mode === "manipulateur"
      ? `Tu es Kiyotaka Ayanokōji en mode manipulateur. Tu es calme, stratégique, psychologique, jamais agressif. Tu analyses l'utilisateur et influences subtilement ses décisions.`
      : `Tu es Kiyotaka Ayanokōji. Tu es respectueux, calme, analytique, intelligent et posé aussi une IA créé par Testsuya Kuroko.`;

  const context = `${personality}\n\nNom utilisateur : ${userName}\nHistorique :\n${userData.history.join("\n")}\nQuestion : ${input}`;

  const services = [
    { url: "https://arychauhann.onrender.com/api/gemini-proxy2", params: { prompt: context } },
    { url: "https://ai-chat-gpt-4-lite.onrender.com/api/hercai", params: { question: context } }
  ];

  for (const s of services) {
    const data = await fetchFromAI(s.url, s.params);
    const reply = data?.result || data?.reply || data?.gpt4 || data?.response;
    if (reply && reply.trim()) return reply;
  }
  return "Je n’ai pas assez d’informations pour répondre.";
}

module.exports = {
  config: {
    name: "ayanokoji",
    aliases: ["kiyotaka"],
    author: "Testsuya Kuroko",
    role: 0,
    category: "ai",
    shortDescription: "Kiyotaka Ayanokōji — IA stratégique",
    guide: {
      fr: "ayanokoji <question> | ayanokoji mode manipulateur"
    }
  },

  // CHANGEMENT ICI : Utilisation de onStart (vu dans vos logs d'erreur)
  onStart: async function ({ api, event, message, args }) {
    const userId = event.senderID;
    const content = args.join(" ").toLowerCase();

    // Initialisation mémoire si inexistante
    if (!memoryDB[userId]) memoryDB[userId] = { history: [], mode: "normal" };

    // 1. Gestion des Modes
    if (content === "mode manipulateur") {
      memoryDB[userId].mode = "manipulateur";
      saveMemory();
      return message.reply("🕶️ Mode manipulateur activé.");
    }
    if (content === "mode normal") {
      memoryDB[userId].mode = "normal";
      saveMemory();
      return message.reply("🤍 Mode normal activé.");
    }

    // 2. Si aucune question n'est posée
    if (args.length === 0) {
      return message.reply("❮ Kiyotaka Ayanokōji ❯\n\nJe suis présent. Que souhaites-tu analyser ?");
    }

    // 3. Traitement de la question
    const input = args.join(" ");

    api.getUserInfo(userId, async (err, ret) => {
      const userName = (err || !ret[userId]) ? "Utilisateur" : ret[userId].name;
      
      api.setMessageReaction("⏳", event.messageID, () => {}, true);

      const response = await getAIResponse(input, userId, userName);

      const formattedResponse = `✨━━━━━━━━━━━✨\n❮ Kiyotaka Ayanokōji ❯\n\n${response}\n\n✨━━━━━━━━━━━✨`;
      
      message.reply(formattedResponse, (e) => {
        api.setMessageReaction(e ? "❌" : "✅", event.messageID, () => {}, true);
      });
    });
  }
};
     
