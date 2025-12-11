const { getPrefix } = global.utils;
const { commands, aliases } = global.GoatBot;

function applyFont(text) {
  const fontMap = {
    'A': '𝓐', 'B': '𝓑', 'C': '𝓒', 'D': '𝓓', 'E': '𝓔', 'F': '𝓕',
    'G': '𝓖', 'H': '𝓗', 'I': '𝓘', 'J': '𝓙', 'K': '𝓚', 'L': '𝓛',
    'M': '𝓜', 'N': '𝓝', 'O': '𝓞', 'P': '𝓟', 'Q': '𝓠', 'R': '𝓡',
    'S': '𝓢', 'T': '𝓣', 'U': '𝓤', 'V': '𝓥', 'W': '𝓦', 'X': '𝓧',
    'Y': '𝓨', 'Z': '𝓩',
    'a': '𝓪', 'b': '𝓫', 'c': '𝓬', 'd': '𝓭', 'e': '𝓮', 'f': '𝓯',
    'g': '𝓰', 'h': '𝓱', 'i': '𝓲', 'j': '𝓳', 'k': '𝓴', 'l': '𝓵',
    'm': '𝓶', 'n': '𝓷', 'o': '𝓸', 'p': '𝓹', 'q': '𝓺', 'r': '𝓻',
    's': '𝓼', 't': '𝓽', 'u': '𝓾', 'v': '𝓿', 'w': '𝔀', 'x': '𝔁',
    'y': '𝔂', 'z': '𝔃'
  };
  return text.split('').map(c => fontMap[c] || c).join('');
}

module.exports = {
  config: {
    name: "help",
    version: "2.0",
    author: "Kyo Soma ✨",
    countDown: 5,
    role: 0,
    shortDescription: { en: "View commands list" },
    longDescription: { en: "Show all commands and details in style!" },
    category: "info",
    guide: { en: "{pn} [command_name]" },
    priority: 1
  },

  onStart: async ({ message, args, event, role }) => {
    const prefix = await getPrefix(event.threadID);

    // 🎴 Si pas d'argument : afficher toutes les commandes
    if (!args[0]) {
      const categories = {};
      let msg = `🌌✨ 𝓑𝓛𝓤𝓔 𝓛𝓞𝓒𝓚 𝓒𝓞𝓜𝓜𝓐𝓝𝓓𝓢 ✨🌌\n\n`;

      for (const [name, cmd] of commands) {
        if (cmd.config.role > role) continue;
        const cat = cmd.config.category || "NO CATEGORY";
        if (!categories[cat]) categories[cat] = [];
        categories[cat].push(name);
      }

      for (const cat of Object.keys(categories).sort()) {
        msg += `🌀─── [ ${applyFont(cat.toUpperCase())} ] ───🌀\n`;
        for (const name of categories[cat].sort()) {
          msg += `⚡ ${applyFont(name)}\n`;
        }
        msg += `\n`;
      }

      msg += `💠 TOTAL COMMANDS: ${commands.size}\n`;
      msg += `💠 PREFIX: ${prefix}\n`;
      msg += `💬 Type "${prefix}help <command>" to see details.\n`;

      await message.reply(msg);
      return;
    }

    // 🎴 Si un argument : afficher les détails d'une commande
    const commandName = args[0].toLowerCase();
    const command = commands.get(commandName) || aliases.get(commandName) && commands.get(aliases.get(commandName));

    if (!command) {
      await message.reply(`❌ Command not found! ❌`);
      return;
    }

    const cfg = command.config;
    const roleText = {0:"All users",1:"Group admins",2:"Bot admins"}[cfg.role] || "Unknown";
    const usage = (cfg.guide?.en || "{pn} " + cfg.name).replace("{pn}", prefix);

    const resp = `
🌟─── [ ${applyFont(cfg.name.toUpperCase())} ] ───🌟
💠 Version: ${cfg.version || "1.0"}
💠 Author: ${cfg.author}
💠 Role: ${roleText}
💠 Cooldown: ${cfg.countDown || 2}s

💬 Description:
${cfg.longDescription?.en || "No description"}

📝 Usage:
${usage}
`;

    await message.reply(resp);
  }
};
