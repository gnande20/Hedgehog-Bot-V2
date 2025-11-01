const axios = require('axios');

module.exports = {
    config: {
        name: "animequiz",
        aliases: ["aq", "quizanime"],
        version: "1.0",
        author: "Camille & Muguru Bachira",
        countDown: 10,
        role: 0,
        category: "game",
        shortDescription: "🎯 Quiz animés style Blue Lock",
        longDescription: "Teste tes connaissances en animés avec des questions difficiles et immersives. Gagne des points et améliore ton classement !",
        guide: {
            fr: "Utilise la commande avec: animequiz pour démarrer"
        }
    },

    langs: {
        fr: {
            startMessage: `⚡ 𝗕𝗹𝘂𝗲 𝗟𝗼𝗰𝗸 𝗔𝗻𝗶𝗺𝗲 𝗤𝘂𝗶𝘇 ⚡
━━━━━━━━━━
🎬 Questions sur les animés !
🕒 Réponds avec A, B, C ou D.
🔥 30 secondes par question.`,
            correct: `✅ Bravo ! Bonne réponse !\n💥 Score: {score}\n⚡ Streak: {streak}`,
            wrong: `❌ Mauvaise réponse !\n🎯 La bonne réponse était: {answer}\n💔 Streak réinitialisé`,
            timeout: `⏰ Temps écoulé !\n🎯 La bonne réponse était: {answer}`,
            endGame: `🏁 Quiz terminé !
━━━━━━━━━━
🎯 Score final: {score}
🔥 Streak max: {streak}`
        }
    },

    animeQuestions: [
        {
            question: "Quel est le protagoniste principal de 'Blue Lock' ?",
            options: ["A. Yoichi Isagi", "B. Rensuke Kunigami", "C. Meguru Bachira", "D. Seishiro Nagi"],
            answer: "A"
        },
        {
            question: "Dans 'Attack on Titan', comment s'appelle le titan colossal ?",
            options: ["A. Eren", "B. Reiner", "C. Armin", "D. Bertolt"],
            answer: "D"
        },
        {
            question: "Quel anime suit l'histoire de Kirito dans un jeu VR ?",
            options: ["A. Konosuba", "B. Sword Art Online", "C. Re:Zero", "D. Tokyo Revengers"],
            answer: "B"
        },
        {
            question: "Qui est le sensei de Naruto Uzumaki ?",
            options: ["A. Kakashi Hatake", "B. Jiraiya", "C. Orochimaru", "D. Tsunade"],
            answer: "A"
        },
        {
            question: "Dans 'My Hero Academia', quel est le pouvoir d'Izuku Midoriya ?",
            options: ["A. Explosion", "B. One For All", "C. Dark Shadow", "D. Electrification"],
            answer: "B"
        }
    ],

    async onStart({ message, args, api }) {
        const { fr } = this.langs;

        let score = 0;
        let streak = 0;
        let maxStreak = 0;

        message.reply(fr.startMessage);

        for (const q of this.animeQuestions) {
            await message.reply(
                `🎯 ${q.question}\n\n${q.options.join("\n")}`
            );

            // Attend la réponse de l'utilisateur (pseudo-code, à adapter selon ton framework)
            const userAnswer = await this.waitForAnswer(api, message.senderID, 30000);

            if (!userAnswer) {
                await message.reply(fr.timeout.replace("{answer}", q.answer));
                streak = 0;
                continue;
            }

            if (userAnswer.toUpperCase() === q.answer) {
                score += 10;
                streak++;
                if (streak > maxStreak) maxStreak = streak;
                await message.reply(fr.correct.replace("{score}", score).replace("{streak}", streak));
            } else {
                streak = 0;
                await message.reply(fr.wrong.replace("{answer}", q.answer));
            }
        }

        await message.reply(fr.endGame.replace("{score}", score).replace("{streak}", maxStreak));
    },

    // Fonction pseudo-code pour récupérer la réponse utilisateur
    async waitForAnswer(api, senderID, timeout) {
        return new Promise((resolve) => {
            const timer = setTimeout(() => resolve(null), timeout);
            
            const handler = (event) => {
                if (event.senderID === senderID) {
                    clearTimeout(timer);
                    api.removeListener('message', handler);
                    resolve(event.body.trim());
                }
            };

            api.on('message', handler);
        });
    }
};
