// 🌐 Cache temporaire pour stocker les groupes par utilisateur
const groupesCache = {};

module.exports = {
  config: {
    name: "pannel",
    version: "2.5",
    author: "Nthang",
    role: 0,
    shortDescription: "Panel admin secret",
    longDescription: "Accès admin style Blue Lock pour Evariste",
    category: "admin",
    guide: {
      fr: "¥pannel [action]"
    }
  },

  onStart: async function ({ message, event, usersData, threadsData, args, api }) {
    const adminIDs = new Set(["61585610189468", "6"]); // 🔹 Liste des admins
    const senderID = event.senderID;

    if (!adminIDs.has(senderID)) {
      return message.reply("❌⛔ Tu n'as pas accès à ce panel. Le maître l'a verrouillé 😌");
    }

    const action = args[0];

    // ───── MENU PRINCIPAL ─────
    if (!action) {
      return message.reply(
        `👑───── BLUE LOCK PANEL ─────👑\n\n` +
        `💠 Choisis une action :\n\n` +
        `💰 1. Voir le solde d'un utilisateur\n` +
        `➕ 2. Ajouter de l'argent à un utilisateur\n` +
        `➖ 3. Retirer de l'argent à un utilisateur\n` +
        `🔁 4. Réinitialiser les streaks 'motrapide'\n` +
        `🏆 5. Voir le top 5 des plus riches\n` +
        `📣 6. Envoyer une annonce à tous les groupes\n` +
        `📋 7. Liste des commandes\n` +
        `👥 8. Voir les groupes\n` +
        `🚪 9. Faire quitter le bot d’un groupe\n` +
        `🚫 10. Block/Unblock/Blocklist\n` +
        `✉️ 11. Diffuser à un groupe précis\n` +
        `📨 12. Diffuser à tous les groupes\n\n` +
        `💠 Pour choisir une action, tape : \`pannel [action]\``
      );
    }

    // ───── LISTE COMMANDES ─────
    if (action === "list") {
      return message.reply(
        `👑───── COMMANDES ADMIN ─────👑\n\n` +
        `💠 pannel solde [uid]\n` +
        `💠 pannel add [uid] [montant]\n` +
        `💠 pannel remove [uid] [montant]\n` +
        `💠 pannel annonce [message]\n` +
        `💠 pannel groupe / groupes\n` +
        `💠 pannel groupes refresh\n` +
        `💠 pannel groupes add [numéro]\n` +
        `💠 pannel quitte [numéro]\n` +
        `💠 pannel block [uid]\n` +
        `💠 pannel unblock [uid]\n` +
        `💠 pannel blocklist\n` +
        `💠 pannel top\n` +
        `💠 pannel reset\n` +
        `💠 diffuse [numéro] [message/media]\n` +
        `💠 diffuseall [message/media]`
      );
    }

    // ───── GROUPES ─────
    if (action === "groupe" || action === "groupes") {
      if (args[1] === "add") {
        const index = parseInt(args[2]) - 1;
        const groupes = groupesCache[senderID];
        if (!groupes || groupes.length === 0) return message.reply("❌ Charge d'abord la liste avec `pannel groupes`.");
        if (isNaN(index) || index < 0 || index >= groupes.length) return message.reply("❌ Numéro invalide.");

        const threadID = groupes[index].threadID;
        try {
          await api.addUserToGroup(senderID, threadID);
          return message.reply(`✅ Ajouté au groupe : ${groupes[index].threadName}`);
        } catch {
          return message.reply("❌ Impossible d'ajouter l'utilisateur au groupe. Le bot est-il admin ?");
        }
      }

      if (args[1] === "refresh") {
        message.reply("🔄 Mise à jour de la liste des groupes...");
      }

      const allThreads = await threadsData.getAll();
      const groupesValides = [];

      for (const t of allThreads) {
        if (!t.threadID || !t.threadName) continue;
        try {
          const info = await api.getThreadInfo(t.threadID);
          if (info?.participantIDs.includes(api.getCurrentUserID())) {
            groupesValides.push({ threadID: t.threadID, threadName: t.threadName });
          }
        } catch {}
      }

      groupesCache[senderID] = groupesValides;
      if (groupesValides.length === 0) return message.reply("❌ Aucun groupe actif trouvé.");

      const liste = groupesValides.map((g, i) => `💠 ${i + 1}. ${g.threadName}`).join("\n");
      return message.reply(
        `👑───── GROUPES ACTIFS ─────👑\n\n${liste}\n\n` +
        `➕ Ajouter : \`pannel groupes add [numéro]\`\n` +
        `🚪 Quitter : \`pannel quitte [numéro]\`\n` +
        `🔁 Actualiser : \`pannel groupes refresh\``
      );
    }

    // ───── QUITTER UN GROUPE ─────
    if (action === "quitte") {
      const index = parseInt(args[1]) - 1;
      const groupes = groupesCache[senderID];
      if (!groupes || groupes.length === 0) return message.reply("❌ Charge d'abord la liste avec `pannel groupes`.");
      if (isNaN(index) || index < 0 || index >= groupes.length) return message.reply("❌ Numéro invalide.");

      const { threadID, threadName } = groupes[index];
      try {
        await api.removeUserFromGroup(api.getCurrentUserID(), threadID);
        return message.reply(`🚪 Le bot a quitté le groupe : ${threadName}`);
      } catch {
        return message.reply("❌ Impossible de quitter ce groupe. Le bot est-il admin ?");
      }
    }

    // ───── BLOCK / UNBLOCK ─────
    if (action === "block") {
      const uid = args[1];
      if (!uid) return message.reply("❌ Utilisation : pannel block [uid]");
      await usersData.set(uid, true, "blocked");
      return message.reply(`🚫 L'utilisateur ${uid} est maintenant bloqué.`);
    }
    if (action === "unblock") {
      const uid = args[1];
      if (!uid) return message.reply("❌ Utilisation : pannel unblock [uid]");
      await usersData.set(uid, false, "blocked");
      return message.reply(`✅ L'utilisateur ${uid} est débloqué.`);
    }
    if (action === "blocklist") {
      const users = await usersData.getAll(["blocked", "name"]);
      const blocked = users.filter(u => u.blocked);
      if (blocked.length === 0) return message.reply("✅ Aucun utilisateur bloqué.");
      const list = blocked.map((u,i)=>`💠 ${i+1}. ${u.name||"Inconnu"} (${u.userID})`).join("\n");
      return message.reply(`🚫 **Liste des bloqués** :\n${list}`);
    }

    // ───── ANNOUNCE ─────
    if (action === "annonce") {
      const text = args.slice(1).join(" ");
      if (!text) return message.reply("❌ Écris un message après `pannel annonce`.");
      const allThreads = await threadsData.getAll();
      const groups = allThreads.filter(t => t.threadID && t.threadName);
      for (const group of groups) {
        try { api.sendMessage(`📢 Annonce admin :\n${text}`, group.threadID); } catch {}
      }
      return message.reply(`✅ Annonce envoyée dans **${groups.length}** groupes.`);
    }

    // ───── GESTION ARGENT ─────
    if (action === "solde") {
      const uid = args[1]; if (!uid) return message.reply("❌ Fournis l'UID de l'utilisateur.");
      const money = await usersData.get(uid, "money") || 0;
      return message.reply(`💰 Solde de ${uid} : ${money} $`);
    }
    if (action === "add") {
      const uid = args[1], montant = parseInt(args[2]);
      if (!uid || isNaN(montant)) return message.reply("❌ Utilisation : pannel add [uid] [montant]");
      const current = await usersData.get(uid, "money") || 0;
      await usersData.set(uid, current + montant, "money");
      return message.reply(`✅ ${montant} $ ajoutés à ${uid}`);
    }
    if (action === "remove") {
      const uid = args[1], montant = parseInt(args[2]);
      if (!uid || isNaN(montant)) return message.reply("❌ Utilisation : pannel remove [uid] [montant]");
      const current = await usersData.get(uid, "money") || 0;
      await usersData.set(uid, Math.max(0, current - montant), "money");
      return message.reply(`✅ ${montant} $ retirés à ${uid}`);
    }

    // ───── TOP USERS ─────
    if (action === "top") {
      const users = await usersData.getAll(["money","name"]);
      const top = users.filter(u=>u.money).sort((a,b)=>b.money-a.money).slice(0,5);
      const topMsg = top.map((u,i)=>`💠 #${i+1} ${u.name} – ${u.money} $`).join("\n");
      return message.reply(`🏆 **Top 5 utilisateurs** :\n${topMsg}`);
    }

    // ───── RESET STREAKS ─────
    if (action === "reset") {
      const all = await usersData.getAll(["motrapide"]);
      for (const user of all) if(user.motrapide) await usersData.set(user.userID,0,"motrapide");
      return message.reply("🔁 Tous les streaks 'motrapide' ont été réinitialisés.");
    }

    // ───── DIFFUSE / DIFFUSEALL ─────
    const sendMessageToThread = async (threadID, text, attachments) => {
      if (attachments.length>0) {
        for(const attach of attachments){
          const file = await api.getAttachment(attach.id);
          await api.sendMessage({ body: text, attachment: file }, threadID);
        }
      } else await api.sendMessage(text, threadID);
    };

    if (action === "diffuse") {
      const index = parseInt(args[1])-1;
      const groupes = groupesCache[senderID];
      const text = args.slice(2).join(" ");
      const attachments = (event.messageReply?.attachments || event.attachments) || [];
      if(!groupes||groupes.length===0) return message.reply("❌ Charge d'abord la liste avec `pannel groupes`.");
      if(isNaN(index)||index<0||index>=groupes.length) return message.reply("❌ Numéro invalide.");
      if(!text && attachments.length===0) return message.reply("❌ Fournis un message ou média à diffuser.");
      try{ await sendMessageToThread(groupes[index].threadID,text,attachments);
        return message.reply(`✅ Message diffusé au groupe : ${groupes[index].threadName}`);
      } catch { return message.reply("❌ Erreur lors de l'envoi."); }
    }

    if (action === "diffuseall") {
      const text = args.slice(1).join(" ");
      const attachments = (event.messageReply?.attachments || event.attachments) || [];
      if(!text && attachments.length===0) return message.reply("❌ Fournis un message ou média à diffuser.");
      const allThreads = await threadsData.getAll();
      let count=0;
      for(const t of allThreads){
        if(!t.threadID||!t.threadName) continue;
        try{
          const info = await api.getThreadInfo(t.threadID);
          if(info?.participantIDs.includes(api.getCurrentUserID())){
            await sendMessageToThread(t.threadID,text,attachments);
            count++;
          }
        }catch{}
      }
      return message.reply(`✅ Message diffusé dans **${count}** groupes.`);
    }

    return message.reply("❌ Commande inconnue. Essaie `pannel list`.");
  }
};
