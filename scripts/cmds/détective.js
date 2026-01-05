// detective.js
const { OpenAI } = require("openai");

// Clé API
const openai = new OpenAI({ 
  apiKey: "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"
});

const games = {};

module.exports = {
  config: {
    name: "detective",
    version: "1.0",
    author: "Testsuya Kuroko",
    role: 0,
    category: "game", // <--- AJOUTÉ : C'était la cause de l'erreur dans les logs
    shortDescription: "Jeu de détective interactif",
    description: "Incarnez un détective et résolvez des enquêtes au manoir Bell",
    guide: {
        fr: "detective [votre action]"
    }
  },

  onStart: async function ({ api, event, args, message }) {
    // Note : On utilise event.senderID pour identifier le joueur
    const userId = event.senderID;
    const reply = (text) => api.sendMessage(text, event.threadID, event.messageID);

    if (!games[userId]) {
      games[userId] = {
        clues: [],
        interrogated: [],
        actions: [],
        step: 0
      };
      return reply(
        "🕵️ Une enquête commence ! Un vol a été signalé au manoir Bell.\n\nTrois suspects sont présents : Alice, Bob et Clara.\n\nQue veux-tu faire ?\n[Interroger Alice] [Interroger Bob] [Interroger Clara] [Chercher un indice]"
      );
    }

    const playerAction = args.join(" ");
    if (!playerAction) return reply("🕵️ Choisissez une action : [Interroger Alice], [Interroger Bob], [Interroger Clara], [Chercher un indice], [Accuser <nom>]");

    games[userId].actions.push(playerAction);

    const prompt = `
Tu es un maître détective narrateur pour un joueur.
Voici l'état actuel de l'enquête : ${JSON.stringify(games[userId])}
Le joueur a choisi : "${playerAction}"
Répond de manière interactive avec :
- Courte narration de la scène
- Choix possibles suivants sous forme de liste (ex: [Interroger Alice], [Chercher un indice], [Accuser quelqu’un])
- Ne révèle jamais le coupable avant que le joueur accuse
`;

    try {
      api.setMessageReaction("🔍", event.messageID, () => {}, true);
      
      const completion = await openai.chat.completions.create({
        model: "gpt-4o-mini", // Correction : gpt-5 n'existe pas, gpt-4o-mini est plus stable
        messages: [{ role: "user", content: prompt }],
        temperature: 0.7
      });

      const gptResponse = completion.choices[0].message.content;
      reply(gptResponse);
    } catch (err) {
      console.error(err);
      reply("❌ Une erreur est survenue avec l'IA. Vérifie ta clé API ou le quota.");
    }
  }
};
      
