const { OpenAI } = require("openai");
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY // Assure-toi que ta clé est dans tes variables d'environnement
});

module.exports = {
  config: {
    name: "clash",
    aliases: ["burn", "roast"],
    version: "1.0",
    author: "Testsuya Kuroko",
    category: "fun",
    description: "Génère un clash à la manière de Kyotaka Ayanokōji",
    cooldown: 5
  },

  async onStart({ message, args, send }) {
    // Récupérer la cible ou le sujet
    const target = args.join(" ") || "la personne que tu as en tête";

    // Créer le prompt pour OpenAI
    const prompt = `
Tu es Kyotaka Ayanokōji, froid, manipulateur et sarcastique. 
Génère un clash unique et intelligent, destiné à "${target}". 
Fais en sorte que ce soit subtil mais dévastateur, 1-2 phrases max.
`;

    try {
      const response = await openai.chat.completions.create({
        model: "gpt-4o-mini", // Modèle conseillé pour style court et percutant
        messages: [
          { role: "system", content: "Tu es Kyotaka Ayanokōji, maître en manipulations et sarcasmes." },
          { role: "user", content: prompt }
        ],
        temperature: 0.8, // plus créatif, moins répétitif
        max_tokens: 60
      });

      const clash = response.choices[0].message.content.trim();
      send(clash);
    } catch (err) {
      console.error(err);
      send("Impossible de générer un clash pour le moment 😅");
    }
  }
};
