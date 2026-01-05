// detective.js
const { OpenAI } = require("openai");

// Clé mise directement dans le code
const openai = new OpenAI({ 
  apiKey: "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"
});

// Stockage temporaire des parties
const games = {};

module.exports = {
  config: {
    name: "detective",
    version: "1.0",
    author: "Testsuya Kuroko",
    role: 0,
    description: "Jeu de détective interactif avec GPT",
  },

  async onStart({ message, args, reply }) {
    const userId = message.senderID;

    if (!games[userId]) {
      games[userId] = {
        clues: [],
        interrogated: [],
        actions: [],
        step: 0
      };
      return reply(
        "🕵️ Une enquête commence ! Un vol a été signalé au manoir Bell. Trois suspects sont présents : Alice, Bob et Clara.\nQue veux-tu faire ?\n[Interroger Alice] [Interroger Bob] [Interroger Clara] [Chercher un indice]"
      );
    }

    const playerAction = args.join(" ");
    if (!playerAction) return reply("Choisis une action : [Interroger Alice], [Interroger Bob], [Interroger Clara], [Chercher un indice], [Accuser <nom>]");

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
      const completion = await openai.chat.completions.create({
        model: "gpt-5-mini",
        messages: [{ role: "user", content: prompt }],
        temperature: 0.7
      });

      const gptResponse = completion.choices[0].message.content;
      reply(gptResponse);
    } catch (err) {
      console.error(err);
      reply("❌ Une erreur est survenue avec GPT. Réessaie.");
    }
  }
};
