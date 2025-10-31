const { getTime, drive } = global.utils;

module.exports = {
  config: {
    name: "leave",
    version: "2.0",
    author: "Camille 💙",
    category: "events"
  },

  langs: {
    en: {
      session1: "matin",
      session2: "midi",
      session3: "après-midi",
      session4: "soir",
      defaultLeaveMessage: `
╔══════════════════╗
║   ⚽ BLUE LOCK ⚽  ║
╠══════════════════╣
║ {userName} a quitté le groupe !
║ ⏰ Moment : {session}
║ 😏 Kiyotaka-style exit
╚══════════════════╝`
    }
  },

  onStart: async ({ threadsData, message, event, api, usersData, getLang }) => {
    if (event.logMessageType !== "log:unsubscribe") return;

    const { threadID, logMessageData, author } = event;
    const threadData = await threadsData.get(threadID);
    if (!threadData.settings.sendLeaveMessage) return;

    const leftId = logMessageData.leftParticipantFbId;
    if (leftId === api.getCurrentUserID()) return;

    const hours = parseInt(getTime("HH"));
    const userName = await usersData.getName(leftId);
    const threadName = threadData.threadName;

    // Messages de départ Kiyotaka + Blue Lock emojis
    const messages = [
      `╔══════════════════╗\n║ ⚽ BLUE LOCK ⚽ ║\n╠══════════════════╣\n║ ${userName} s'en va… prévisible 😏\n║ Groupe : ${threadName}\n║ Moment : ${hours}h\n╚══════════════════╝`,
      `╔══════════════════╗\n║ ⚡ FOOT ALERT ⚡ ║\n╠══════════════════╣\n║ ${userName} a quitté le groupe 🏟️\n║ Kiyotaka-style exit\n╚══════════════════╝`,
      `╔══════════════════╗\n║ ⚽ BLUE LOCK ⚽ ║\n╠══════════════════╣\n║ Départ de ${userName} 💨\n║ Moment : ${hours}h\n║ Rien de significatif… 😎\n╚══════════════════╝`,
      `╔══════════════════╗\n║ 🔥 BLUE LOCK 🔥 ║\n╠══════════════════╣\n║ ${userName} disparaît…\n║ Les dynamiques restent intactes ⚽\n╚══════════════════╝`
    ];

    // Choisir un message aléatoire
    let leaveMessage = messages[Math.floor(Math.random() * messages.length)];

    const form = { body: leaveMessage };

    if (leaveMessage.includes("{userNameTag}")) {
      form.mentions = [{ id: leftId, tag: userName }];
    }

    if (threadData.data.leaveAttachment?.length) {
      const attachments = await Promise.all(
        threadData.data.leaveAttachment.map(file => drive.getFile(file, "stream").catch(() => null))
      );
      form.attachment = attachments.filter(Boolean);
    }

    message.send(form);
  }
};
