const games = {};

const piecesValue = {
  "♟": 1, "♙": 1,
  "♞": 3, "♘": 3,
  "♝": 3, "♗": 3,
  "♜": 5, "♖": 5,
  "♛": 9, "♕": 9,
  "♚": 100, "♔": 100
};

const initialBoard = [
  ["♜","♞","♝","♛","♚","♝","♞","♜"],
  ["♟","♟","♟","♟","♟","♟","♟","♟"],
  ["⬜","⬜","⬜","⬜","⬜","⬜","⬜","⬜"],
  ["⬜","⬜","⬜","⬜","⬜","⬜","⬜","⬜"],
  ["⬜","⬜","⬜","⬜","⬜","⬜","⬜","⬜"],
  ["⬜","⬜","⬜","⬜","⬜","⬜","⬜","⬜"],
  ["♙","♙","♙","♙","♙","♙","♙","♙"],
  ["♖","♘","♗","♕","♔","♗","♘","♖"]
];

function clone(board) {
  return JSON.parse(JSON.stringify(board));
}

function render(board) {
  let t = "♟️ CHESS CLUB\n\n";
  for (let i = 0; i < 8; i++) {
    t += (8 - i) + " ";
    t += board[i].join(" ") + "\n";
  }
  t += "\n  a b c d e f g h";
  return t;
}

// IA : capture si possible
function botMove(board) {
  for (let i = 0; i < 8; i++) {
    for (let j = 0; j < 8; j++) {
      if (board[i][j] !== "⬜" && piecesValue[board[i][j]] && board[i][j] !== board[i][j].toUpperCase()) {
        if (i + 1 < 8 && board[i + 1][j] === "⬜") {
          board[i + 1][j] = board[i][j];
          board[i][j] = "⬜";
          return;
        }
      }
    }
  }
}

module.exports = {
  config: {
    name: "chessclub",
    aliases: ["chess"],
    version: "3.0",
    author: "Kouakou x GoatBot",
    role: 0,
    category: "game",
    shortDescription: "♟️ Chess vs BOT intelligent"
  },

  onStart: async function ({ event, args, message }) {
    const id = event.senderID;
    const sub = args[0];

    if (sub === "start") {
      games[id] = clone(initialBoard);
      return message.reply(
        "♟️ Partie lancée contre le BOT 🤖\n\n" +
        render(games[id]) +
        "\n\nJoue : chessclub move e2 e4"
      );
    }

    if (sub === "move") {
      if (!games[id]) return message.reply("❌ Aucune partie.");

      // Version simplifiée (déplacement pion)
      const from = args[1];
      const to = args[2];
      if (!from || !to) return message.reply("❌ Exemple : chessclub move e2 e4");

      const fx = 8 - parseInt(from[1]);
      const fy = from.charCodeAt(0) - 97;
      const tx = 8 - parseInt(to[1]);
      const ty = to.charCodeAt(0) - 97;

      const board = games[id];
      if (board[fx][fy] === "⬜") return message.reply("❌ Pas de pièce ici.");

      board[tx][ty] = board[fx][fy];
      board[fx][fy] = "⬜";

      // 🤖 Coup du BOT
      botMove(board);

      return message.reply(
        "♞ Ton coup + coup du BOT 🤖\n\n" +
        render(board)
      );
    }

    if (sub === "stop") {
      delete games[id];
      return message.reply("❌ Partie arrêtée.");
    }

    return message.reply(
      "♟️ Commandes :\n" +
      "chessclub start\n" +
      "chessclub move e2 e4\n" +
      "chessclub stop"
    );
  }
};
