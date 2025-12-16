const moment = require("moment-timezone");

module.exports = {
  config: {
    name: "autoaccept",
    version: "1.2",
    author: "Camille & Muguru Bachira 💥",
    countDown: 13,
    role: 2,
    shortDescription: "Accepte automatiquement les demandes d’amis",
    longDescription: "Mode Blue Lock : accepte automatiquement les demandes d’amis Facebook avec style ⚡",
    category: "⚽ Blue Lock | Owner",
  },

  onStart: async function() {},

  onLoad: async function ({ api }) {
    const ownerID = "61568791604271"; // ton ID
    const logThreadID = "1286661779130987"; // où envoyer les logs

    setInterval(async () => {
      try {
        const requests = await getListOfFriendRequests(api);
        if (!requests || requests.length === 0) return;

        const accepted = [];
        const failed = [];

        for (const req of requests) {
          const form = {
            av: api.getCurrentUserID(),
            fb_api_req_friendly_name: "FriendingCometFriendRequestConfirmMutation",
            doc_id: "3147613905362928",
            variables: JSON.stringify({
              input: {
                friend_requester_id: req.node.id,
                source: "friends_tab",
                actor_id: api.getCurrentUserID(),
                client_mutation_id: Math.floor(Math.random() * 9999).toString(),
              },
              scale: 3,
              refresh_num: 0,
            }),
          };

          try {
            const res = await api.httpPost("https://www.facebook.com/api/graphql/", form);
            const json = JSON.parse(res);
            if (!json.errors) accepted.push(req.node.name);
            else failed.push(req.node.name);
          } catch {
            failed.push(req.node.name);
          }
        }

        // Heure locale
        const now = moment().tz("Africa/Abidjan").format("HH:mm:ss");

        // Message Blue Lock
        const message = `
🏟️ 𝗕𝗟𝗨𝗘 𝗟𝗢𝗖𝗞 𝗔𝗨𝗧𝗢𝗔𝗖𝗖𝗘𝗣𝗧 ⚡
🕒 ${now}

🔥 𝗡𝗢𝗨𝗩𝗘𝗔𝗨𝗫 𝗝𝗢𝗨𝗘𝗨𝗥𝗦 𝗔𝗖𝗖𝗘𝗣𝗧𝗘𝗦 (${accepted.length}) :
${accepted.length > 0 ? accepted.map((n, i) => `⚡ ${i + 1}. ${n}`).join("\n") : "Aucun challenger aujourd'hui..."}

💀 𝗘𝗖𝗛𝗘𝗖𝗦 (${failed.length}) :
${failed.length > 0 ? failed.map((n, i) => `❌ ${i + 1}. ${n} n'a pas été accepté`).join("\n") : "Aucun raté, tous les challengers sont dans l'équipe !"}

#𝗕𝗟𝗨𝗘𝗟𝗢𝗖𝗞 #𝗔𝗨𝗧𝗢𝗔𝗖𝗖𝗘𝗣𝗧 #𝗠𝗨𝗚𝗨𝗥𝗨
        `;

        api.sendMessage(message, logThreadID);
        api.sendMessage(`⚡ Mode Blue Lock : ${accepted.length} demandes d’amis acceptées !`, ownerID);

      } catch (err) {
        console.error("Erreur autoaccept:", err);
      }
    }, 900000); // toutes les 15 minutes
  }
};

// Fonction pour récupérer les demandes d’amis
async function getListOfFriendRequests(api) {
  const form = {
    av: api.getCurrentUserID(),
    fb_api_req_friendly_name: "FriendingCometFriendRequestsRootQueryRelayPreloader",
    fb_api_caller_class: "RelayModern",
    doc_id: "4499164963466303",
    variables: JSON.stringify({ input: { scale: 3 } }),
  };

  const res = await api.httpPost("https://www.facebook.com/api/graphql/", form);
  const json = JSON.parse(res);
  return json?.data?.viewer?.friending_possibilities?.edges || [];
}
