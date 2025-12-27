
const axios = require("axios");
const fs = require("fs");
const path = require("path");

// ================= MÉMOIRE =================
const memoryPath = path.join(__dirname, "kyo_memory.json");

let memory = {};
if (fs.existsSync(memoryPath)) {
  try {
    memory = JSON.parse(fs.readFileSync(memoryPath, "utf8"));
  } catch (e) {
    memory = {};
  }
}

function saveMemory() {
  fs.writeFileSync(memoryPath, JSON.stringify(memory, null, 2));
}

// ================= API =================
async function fetchFromAI(url, params) {
  try {
    const res = await axios.get(url, {
      params: params,
      timeout: 20000
    });
    return res.data;
  } catch (e) {
    console.error("API error:", e.message);
    return null;
  }
}

async function getAIResponse(input, userName, userID) {
  if (!memory[userID]) memory[userID] = [];

  // Message utilisateur
  memory[userID].push(userName + ": " + input);
  if (memory[userID].length > 10) memory[userID].shift();
  saveMemory();

  const context = memory[userID].join("\n");

  const services = [
    {
      url: "https://arychauhann.onrender.com/api/gemini-proxy2",
      params: {
        prompt:
          "Tu es une IA ton créateur est Kyo soma (Camille)et ton sous créateur est Célestin " 
    {
      url: "https://ai-chat-gpt-4-lite.onrender.com/api/hercai",
      params: {
        question:
          "Tu es Kyo Soma.\n" +
          "Createurs : Kyo Soma et Celestin.\n\n" +
          "Conversation :\n" +
          context
      }
    }
  ];

  let response = "😾 Tch… serveur indisponible.";

  for (let i = 0; i < services.length; i++) {
    const data = await fetchFromAI(services[i].url, services[i].params);
    if (!data) continue;

    const reply = data.result || data.reply || data.gpt4 || data.response;
    if (reply && reply.trim()) {
      response = reply.trim();
      break;
    }
  }

  // Message bot
  memory[userID].push("Kyo Soma: " + response);
  if (memory[userID].length > 10) memory[userID].shift();
  saveMemory();

  return response;
}

// ================= REGEX CRÉATEUR =================
const creatorRegex =
  /(qui\s+ta\s+cree|ton\s+createur|createur|qui\s+ta\s+fait)/i;

// ================= MODULE =================
module.exports = {
  config: {
    name: "kyosoma",
    aliases: ["kyo soma", "kyo"],
    author: "Kyo Soma",
    role: 0,
    category: "ai",
    shortDescription: "IA Kyo Soma avec memoire",
    guide: {
      fr: "kyo <message>"
    }
  },

  // ===== AVEC PRÉFIXE =====
  onStart: async function (ctx) {
    const api = ctx.api;
    const event = ctx.event;
    const args = ctx.args;

    const input = args.join(" ").trim();
    if (!input) {
      return api.sendMessage(
        "😾 Kyo Soma :\n\nParle.",
        event.threadID,
        event.messageID
      );
    }

    api.getUserInfo(event.senderID, async function (err, data) {
      if (err) return;
      const userName =
        data[event.senderID] && data[event.senderID].name
          ? data[event.senderID].name
          : "toi";
      api.setMessageReaction("⏳", event.messageID, function () {}, true);
      const response = await getAIResponse(input, userName, event.senderID);

      api.sendMessage(
        "😾 Kyo Soma :\n\n" + response,
        event.threadID,
        event.messageID,
        function () {
          api.setMessageReaction("✅", event.messageID, function () {}, true);
        }
      );
    });
  },

  // ===== SANS PRÉFIXE =====
  onChat: async function (ctx) {
    const api = ctx.api;
    const event = ctx.event;
    const message = ctx.message;

    if (!event.body) return;
    const body = event.body.trim();

    if (/^ai\b/i.test(body)) return;

    if (/^kyo\s+soma$/i.test(body)) {
      return message.reply("😾 Kyo Soma :\n\nQuoi ?");
    }

    const match = body.match(/^(kyo|kyo\s+soma)\s+(.*)/i);
    if (!match) return;

    const input = match[2].trim();
    if (!input) return;

    api.getUserInfo(event.senderID, async function (err, data) {
      if (err) return;
      const userName =
        data[event.senderID] && data[event.senderID].name
          ? data[event.senderID].name
          : "toi";

      if (creatorRegex.test(input)) {
        return message.reply(
          "😾 Kyo Soma :\n\nCreateur : **Kyo Soma**. Celestin aussi."
        );
      }

      api.setMessageReaction("⏳", event.messageID, function () {}, true);
      const response = await getAIResponse(input, userName, event.senderID);

      message.reply(
        "😾 Kyo Soma :\n\n" + response,
        function () {
          api.setMessageReaction("✅", event.messageID, function () {}, true);
        }
      );
    });
  }
};
