// detective.js
const { OpenAI } = require("openai");

// Clé sécurisée via les variables d'environnement
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY
});

// Stockage temporaire des parties
const games = {};

module.exports = {
  config: {
    name: "detective",
    version: "1.1",
    author: "Testsuya Kuroko",
    role: 0,
    category: "game", // <--- INDISPENSABLE : Résout l'erreur 'category undefined'
    description: "Jeu de détective interactif avec GPT",
    guide: {
      fr: "detective <votre action>"
    }
  },

  onStart: async function ({ api, event, args, message }) {
    const userId = event.senderID;
    const reply = (text) => api.sendMessage(text, event.threadID, event.messageID);

    // Initialiser la partie si elle n'existe pas
    if (!games[userId]) {
      games[userId] = {
        clues: [],
        interrogated: [],
        actions: [],
        step: 0
      };
      return reply(
        "🕵️ Une enquête commence ! Un vol a été signalé au manoir Bell.\n\nTrois suspects sont présents : Alice, Bob et Clara.\nQue veux-tu faire ?\n[Interroger Alice] [Interroger Bob] [Interroger Clara] [Chercher un indice]"
      );
    }

    // Créer l'action du joueur
    const playerAction = args.join(" ");
    if (!playerAction) {
        return reply("🕵️ Choisi une action : [Interroger Alice], [Interroger Bob], [Interroger Clara], [Chercher un indice], [Accuser <nom>]");
    }

    // Mettre à jour l'état du jeu
    games[userId].actions.push(playerAction);

    // Préparer le prompt pour GPT
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
      // Indiquer que le bot réfléchit
      api.setMessageReaction("🔍", event.messageID, () => {}, true);

      const completion = await openai.chat.completions.create({
        model: "gpt-4o-mini", // Correction : gpt-5 n'est pas encore disponible
        messages: [{ role: "user", content: prompt }],
        temperature: 0.7
      });

      const gptResponse = completion.choices[0].message.content;

      // Envoyer la réponse au joueur
      reply(gptResponse);
    } catch (err) {
      console.error("Erreur OpenAI:", err.message);
      reply("❌ Une erreur est survenue avec l'IA. Vérifie ta clé API sur Render.");
    }
  }
};

