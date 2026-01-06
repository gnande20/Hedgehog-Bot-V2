const games = {};
const scores = {};

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

const pieceValues = {
  "♙":1,"♖":5,"♘":3,"♗":3,"♕":9,"♔":0,
  "♟":1,"♜":5,"♞":3,"♝":3,"♛":9,"♚":0
};

const phrasesKyotaka = [
  "⏳ Chaque mouvement révèle ta stratégie...",
  "🧠 Analyse tes choix avant de bouger...",
  "⚔️ Même un pion peut devenir ton meilleur allié.",
  "🎯 Garde ton calme. Tout est sous contrôle.",
  "👁️ Chaque erreur te rapproche de la victoire...",
  "💡 La patience est souvent la clé du succès."
];

function phraseAleatoire(){ 
  return phrasesKyotaka[Math.floor(Math.random()*phrasesKyotaka.length)]; 
}

function clone(board){ 
  return JSON.parse(JSON.stringify(board)); 
}

function render(board){
  let t = "♟️ ─── PLATEAU ─── ♟️\n\n";
  for(let i=0;i<8;i++) t += (8-i)+" "+board[i].join(" ")+"\n";
  t += "\n  a b c d e f g h\n──────────────────────────\n";
  return t;
}

// Génère uniquement les coups légaux pour les pions
function generateButtons(board){
  const buttons = [];
  for(let j=0;j<8;j++){
    let i = 6; // ligne des pions du joueur
    if(board[i][j] === "♙"){
      // avancer 1 case
      if(board[i-1][j] === "⬜") buttons.push({type:"postback", title:`${String.fromCharCode(97+j)}2→${String.fromCharCode(97+j)}3`, payload:`move ${String.fromCharCode(97+j)}2 ${String.fromCharCode(97+j)}3`});
      // avancer 2 cases depuis ligne initiale
      if(board[i-1][j]==="⬜" && board[i-2][j]==="⬜") buttons.push({type:"postback", title:`${String.fromCharCode(97+j)}2→${String.fromCharCode(97+j)}4`, payload:`move ${String.fromCharCode(97+j)}2 ${String.fromCharCode(97+j)}4`});
      // capture diagonale gauche
      if(j-1>=0 && "♟♜♞♝♛♚".includes(board[i-1][j-1])) buttons.push({type:"postback", title:`${String.fromCharCode(97+j)}2→${String.fromCharCode(97+j-1)}3`, payload:`move ${String.fromCharCode(97+j)}2 ${String.fromCharCode(97+j-1)}3`});
      // capture diagonale droite
      if(j+1<8 && "♟♜♞♝♛♚".includes(board[i-1][j+1])) buttons.push({type:"postback", title:`${String.fromCharCode(97+j)}2→${String.fromCharCode(97+j+1)}3`, payload:`move ${String.fromCharCode(97+j)}2 ${String.fromCharCode(97+j+1)}3`});
    }
  }
  buttons.push({type:"postback", title:"stop", payload:"stop"});
  return buttons;
}

// BOT simple
function botMove(board, id){
  for(let i=0;i<8;i++){
    for(let j=0;j<8;j++){
      const piece = board[i][j];
      if(piece!=="⬜" && "♟♜♞♝♛♚".includes(piece)){
        // capture diagonale droite
        if(i+1<8 && j+1<8 && "♙♖♘♗♕♔".includes(board[i+1][j+1])){
          scores[id].bot += pieceValues[board[i+1][j+1]];
          board[i+1][j+1]=piece; board[i][j]="⬜"; return `🤖 BOT capture un pion !`; }
        // capture diagonale gauche
        if(i+1<8 && j-1>=0 && "♙♖♘♗♕♔".includes(board[i+1][j-1])){
          scores[id].bot += pieceValues[board[i+1][j-1]];
          board[i+1][j-1]=piece; board[i][j]="⬜"; return `🤖 BOT capture un pion !`; }
        // avance droit
        if(i+1<8 && board[i+1][j]==="⬜"){ board[i+1][j]=piece; board[i][j]="⬜"; return "🤖 BOT avance prudemment."; }
      }
    }
  }
  return "🤖 BOT hésite...";
}

module.exports={
  config:{
    name:"chessclub",
    aliases:["chess"],
    version:"9.0",
    author:"Testsuya Kuroko",
    role:0,
    category:"game",
    shortDescription:"♟️ Chess interactif pions + BOT + score"
  },

  onStart: async function({ event, args, sendButton }){
    const id = event.senderID;
    const playerName = event.senderName || "Joueur";

    if(!games[id]){
      games[id]=clone(initialBoard);
      scores[id]={player:0, bot:0};
      return sendButton(
        `♟️ Partie lancée !\nClique sur un bouton pour jouer :\n\n${render(games[id])}\n${phraseAleatoire()}\nScore : ${playerName} 0 - 0 BOT`,
        generateButtons(games[id])
      );
    }

    const input = args.join(" ").trim();

    if(input==="stop"){
      const finalScore = `${playerName} ${scores[id].player} - ${scores[id].bot} BOT`;
      delete games[id]; delete scores[id];
      return sendButton(`❌ Partie arrêtée.\nScore final : ${finalScore}`, []);
    }

    if(!input.match(/^move [a-h][1-8] [a-h][1-8]$/)){
      return sendButton("❌ Clique sur un bouton pour jouer.", generateButtons(games[id]));
    }

    const [_, from, to] = input.split(" ");
    const fx=8-parseInt(from[1]), fy=from.charCodeAt(0)-97;
    const tx=8-parseInt(to[1]), ty=to.charCodeAt(0)-97;
    const board = games[id];

    if(board[fx][fy]==="⬜") return sendButton("❌ Pas de pièce ici.", generateButtons(board));

    // Déplacer le joueur et capturer si nécessaire
    if(board[tx][ty]!=="⬜") scores[id].player += pieceValues[board[tx][ty]];
    board[tx][ty]=board[fx][fy]; board[fx][fy]="⬜";

    // Coup du BOT
    const botMessage = botMove(board, id);

    const scoreDisplay = `${playerName} ${scores[id].player} - ${scores[id].bot} BOT`;

    return sendButton(
      `♞ Ton coup : ${from}→${to}\n${botMessage}\n\n${render(board)}\n${phraseAleatoire()}\nScore : ${scoreDisplay}`,
      generateButtons(board)
    );
  }
};
