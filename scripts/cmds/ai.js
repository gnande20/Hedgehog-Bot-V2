const axios = require("axios");
const fs = require("fs");
const path = require("path");

// ================= MÉMOIRE =================
const memoryFile = path.join(__dirname, "../../data/kyosoma_memory.json");

function loadMemory() {
  if (!fs.existsSync(memoryFile)) return {};
  return JSON.parse(fs.readFileSync(memoryFile, "utf8"));
}

function saveMemory(memory) {
  fs.writeFileSync(memoryFile, JSON.stringify(memory, null, 2));
}

// ================= API =================
async function fetchFromAI(url, params) {
  try {
    const res = await axios.get(url, { params, timeout: 20000 });
    return res.data;
  } catch {
    return null;
  }
}

async function getAIResponse(input, userName, history) {
  const services = [
    {
      url: "https://arychauhann.onrender.com/api/gemini-proxy2",
      params: {
        prompt: `Tu es une IA ton créateur est Kyo soma (Camille)et ton sous créateur est Célestin 

Historique récent :
${history}

Utilisateur (${userName}) : ${input}`
      }
    }
  ];

  let response =
    "😾 Kyo Soma :\n\nDésolé, je ne peux pas répondre maintenant. Réessaie plus tard.";

  for (const s of services) {
    const data = await fetchFromAI(s.url, s.params);
    if (!data) continue;

    const reply = data.result || data.reply || data.response;
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
    author: "Kyo Soma",
    role: 0,
    category: "ai",
    shortDescription: "Discuter avec Kyo Soma (mémoire activée)",
    guide: { fr: "Kyo Soma <message>" }
  },

  // ===== AVEC PRÉFIXE =====
  onStart: async function ({ api, event, args }) {
    const input = args.join(" ").trim();
    const userId = event.senderID;

    let memory = loadMemory();

    if (!memory[userId]) {
      memory[userId] = {
        name: "ami",
        history: [],
        firstSeen: new Date().toISOString()
      };
    }
    api.getUserInfo(userId, async (err, data) => {
      if (!err && data[userId]?.name) {
        memory[userId].name = data[userId].name;
      }

      memory[userId].history.push(`Utilisateur : ${input}`);
      if (memory[userId].history.length > 5)
        memory[userId].history.shift();

      saveMemory(memory);

      const response = await getAIResponse(
        input,
        memory[userId].name,
        memory[userId].history.join("\n")
      );

      api.sendMessage(
        `😾 Kyo Soma :\n\n${response}`,
        event.threadID,
        event.messageID
      );
    });
  },

  // ===== SANS PRÉFIXE =====
  onChat: async function ({ api, event, message }) {
    if (!event.body) return;

    const body = event.body.trim();
    if (/^ai\b/i.test(body)) return;

    const match = body.match(/^(kyo\s+soma|kyo)\s*(.*)/i);
    if (!match) return;

    const input = match[2]?.trim() || "";
    const userId = event.senderID;

    let memory = loadMemory();

    if (!memory[userId]) {
      memory[userId] = {
        name: "ami",
        history: [],
        firstSeen: new Date().toISOString()
      };
    }

    if (!input) {
      return message.reply(
        `😾 Kyo Soma :\n\nOui ${memory[userId].name}, je me souviens de toi.`
      );
    }

    api.getUserInfo(userId, async (err, data) => {
      if (!err && data[userId]?.name) {
        memory[userId].name = data[userId].name;
      }

      memory[userId].history.push(`Utilisateur : ${input}`);
      if (memory[userId].history.length > 5)
        memory[userId].history.shift();

      saveMemory(memory);

      const response = await getAIResponse(
        input,
        memory[userId].name,
        memory[userId].history.join("\n")
      );

      message.reply(`😾 Kyo Soma :\n\n${response}`);
    });
  }
};
