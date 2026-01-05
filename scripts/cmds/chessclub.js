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
  "👁️ Chaque erreur que tu fais me rapproche de la victoire...",
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

function generateButtons(board){
  const buttons = [];
  // On limite à quelques coups pour ne pas bloquer l'interface Messenger
  for(let i=6;i<=6;i++){ 
    for(let j=0;j<8;j++){
      if(board[i][j]==="♙"){
        if(board[i-1][j]==="⬜") {
            buttons.push({type:"postback", title:`${String.fromCharCode(97+j)}${8-i}→${String.fromCharCode(97+j)}${8-(i-1)}`, payload:`move ${String.fromCharCode(97+j)}${8-i} ${String.fromCharCode(97+j)}${8-(i-1)}`});
        }
      }
      if(buttons.length >= 5) break; // Limite pour l'affichage
    }
  }
  buttons.push({type:"postback", title:"Arrêter", payload:"stop"});
  return buttons;
}

function botMove(board, id){
  for(let i=0;i<8;i++){
    for(let j=0;j<8;j++){
      const piece = board[i][j];
      if(piece!=="⬜" && "♟♜♞♝♛♚".includes(piece)){
        if(i+1<8 && j+1<8 && "♙♖♘♗♕♔".includes(board[i+1][j+1])){
          scores[id].bot += pieceValues[board[i+1][j+1]];
          board[i+1][j+1]=piece; board[i][j]="⬜"; return `🤖 BOT capture une pièce !`; 
        }
        if(i+1<8 && board[i+1][j]==="⬜"){ board[i+1][j]=piece; board[i][j]="⬜"; return "🤖 BOT avance prudemment."; }
      }
    }
  }
  return "🤖 BOT attend ton erreur.";
}

module.exports={
  config:{
    name:"chessclub",
    aliases:["chess", "echecs"],
    version:"8.0",
    author:"Testsuya Kuroko",
    role:0,
    category:"game",
    shortDescription: "Jeu d'échecs stratégique",
    guide: { fr: "chessclub" }
  },

  onStart: async function({ api, event, args, message, sendButton }){
    const id = event.senderID;
    
    // Sécurité pour le nom
    const playerName = "Joueur"; 

    // Initialisation de la partie
    if(!games[id]){
      games[id] = clone(initialBoard);
      scores[id] = {player:0, bot:0};
      
      const msg = `♟️ Partie lancée !\n\n${render(games[id])}\n${phraseAleatoire()}\nScore : ${playerName} 0 - 0 BOT`;
      
      return typeof sendButton === "function" 
        ? sendButton(msg, generateButtons(games[id]), event.threadID)
        : message.reply(msg);
    }

    const input = args.join(" ").trim();

    // Arrêt de la partie
    if(input === "stop" || input === "Arrêter"){
      const finalScore = `${playerName} ${scores[id].player} - ${scores[id].bot} BOT`;
      delete games[id]; 
      delete scores[id];
      return message.reply(`❌ Partie terminée.\nScore final : ${finalScore}`);
    }

    // Analyse du mouvement
    const moveMatch = input.match(/move ([a-h][1-8]) ([a-h][1-8])/i);
    if(!moveMatch){
      return message.reply("♟️ Choisissez un mouvement via les boutons.");
    }

    const from = moveMatch[1];
    const to = moveMatch[2];
    
    const fx=8-parseInt(from[1]), fy=from.toLowerCase().charCodeAt(0)-97;
    const tx=8-parseInt(to[1]), ty=to.toLowerCase().charCodeAt(0)-97;
    const board = games[id];

    // Exécution du coup
    if(board[tx][ty]!=="⬜") scores[id].player += (pieceValues[board[tx][ty]] || 0);
    board[tx][ty]=board[fx][fy]; 
    board[fx][fy]="⬜";

    // Coup du BOT
    const botMessage = botMove(board, id);
    const scoreDisplay = `${playerName} ${scores[id].player} - ${scores[id].bot} BOT`;

    const response = `♞ Coup : ${from}→${to}\n${botMessage}\n\n${render(board)}\n${phraseAleatoire()}\nScore : ${scoreDisplay}`;

    if(typeof sendButton === "function") {
        return sendButton(response, generateButtons(board), event.threadID);
    } else {
        return message.reply(response);
    }
  }
};
           
