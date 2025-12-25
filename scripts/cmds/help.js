const { getPrefix } = global.utils;
const { commands, aliases } = global.GoatBot;

function applyFont(text = "") {
  const fontMap = {
    A:'𝗔',B:'𝗕',C:'𝗖',D:'𝗗',E:'𝗘',F:'𝗙',G:'𝗚',H:'𝗛',I:'𝗜',J:'𝗝',
    K:'𝗞',L:'𝗟',M:'𝗠',N:'𝗡',O:'𝗢',P:'𝗣',Q:'𝗤',R:'𝗥',S:'𝗦',
    T:'𝗧',U:'𝗨',V:'𝗩',W:'𝗪',X:'𝗫',Y:'𝗬',Z:'𝗭',
    a:'𝗮',b:'𝗯',c:'𝗰',d:'𝗱',e:'𝗲',f:'𝗳',g:'𝗴',h:'𝗵',i:'𝗶',
    j:'𝗷',k:'𝗸',l:'𝗹',m:'𝗺',n:'𝗻',o:'𝗼',p:'𝗽',q:'𝗾',
    r:'𝗿',s:'𝗌',t:'𝘁',u:'𝘂',v:'𝘃',w:'𝘄',x:'𝘅',y:'𝘆',z:'𝘇'
  };
  return [...text].map(c => fontMap[c] || c).join('');
}

module.exports = {
  config: {
    name: "help",
    version: "🎄 Noël Edition",
    author: "Kyo Soma 🎅",
    role: 0,
    countDown: 5,
    shortDescription: { en: "Christmas command menu" },
    longDescription: { en: "Cool Christmas themed command list" },
    category: "info",
    guide: { en: "{pn}help [command]" },
    priority: 1
  },

  onStart: async ({ message, args, event, role }) => {
    const prefix = await getPrefix(event.threadID);

    // 🎄 MENU PRINCIPAL
    if (!args[0]) {
      const categories = {};
      let visibleCount = 0;

      let msg = `
🎄❄️━━━━━━━━━━━━━━━━━━❄️🎄
   🎅 𝗖𝗛𝗥𝗜𝗦𝗧𝗠𝗔𝗦 𝗠𝗘𝗡𝗨 🎅
🎄❄️━━━━━━━━━━━━━━━━━━❄️🎄

☃️ Prefix : ${prefix}
`;

      for (const [name, cmd] of commands) {
        if (!cmd?.config) continue;
        if (cmd.config.role > role) continue;

        const cat = cmd.config.category || "other";
        if (!categories[cat]) categories[cat] = [];
        categories[cat].push(name);
        visibleCount++;
      }

      for (const cat of Object.keys(categories).sort()) {
        msg += `\n🎁 ${applyFont(cat.toUpperCase())}\n`;
        msg += `❄️──────────────❄️\n`;
        for (const name of categories[cat].sort()) {
          msg += `🎄 ${applyFont(name)}\n`;
        }
      }

      // 🎄 FOOTER NOËL
      msg += `
❄️━━━━━━━━━━━━━━━━━━❄️
🎁 ${visibleCount} commandes disponibles
🎅 ${prefix}help <commande>
❄️ Joyeux Noël ❄️
❄️━━━━━━━━━━━━━━━━━━❄️
`;

      return message.reply(msg);
    }

    // 🎁 INFO COMMANDE
    const cmdName = args[0].toLowerCase();
    const command =
      commands.get(cmdName) ||
      (aliases.get(cmdName) && commands.get(aliases.get(cmdName)));

    if (!command) {
      return message.reply("❌ Commande introuvable 🎄");
    }

    const cfg = command.config;
    const roleText = { 0: "Tous", 1: "Admins groupe", 2: "Admins bot" }[cfg.role] || "Inconnu";
    const usage = (cfg.guide?.en || `${prefix}${cfg.name}`).replace("{pn}", prefix);

    const resp = `
🎄━━━━━━━━━━━━━━🎄
   🎁 𝗜𝗡𝗙𝗢 𝗖𝗢𝗠𝗠𝗔𝗡𝗗𝗘
🎄━━━━━━━━━━━━━━🎄

🎅 Nom      : ${applyFont(cfg.name)}
🎁 Version  : ${cfg.version || "1.0"}
🎄 Auteur   : ${cfg.author}
🔔 Accès    : ${roleText}
⏱ Cooldown : ${cfg.countDown || 2}s

❄️ Description
${cfg.longDescription?.en || "Aucune description"}

🎁 Utilisation
${usage}
`;

    return message.reply(resp);
  }
};
