//sreens
const mainMenu = document.getElementById("main-menu");
const onlineGameMenu = document.getElementById("online-game-menu");
const gameScreen = document.getElementById("game-screen");
//buttons
const onlineGameBtn = document.getElementById("online-game");
const createGameBtn = document.getElementById("create-game");
const backToMenuBtn = document.getElementById("back-to-menu");
const leaveGameBtn = document.getElementById("leave-game");
const gameList = document.getElementById("game-list");
let currentGameID = null;
let socket = null;
let clientID;
// Switch to online game menu
onlineGameBtn.addEventListener("click", () => {
    socket = new WebSocket("ws://localhost:3000");
    clientID = `player-${Math.floor(Math.random() * 10000)}`;
    mainMenu.classList.add("hidden");
    onlineGameMenu.classList.remove("hidden");
    socket.onopen = () => {
        console.log("Connected to server");
        socket.send(JSON.stringify({ type: "connect", clientID }));
    };
    socket.onmessage = (event) => {
        const data = JSON.parse(event.data);
        console.log("Received Message: ", data);
        if (data.type === "updateGames") {
            updateGameList(data.games);
        }
        if (data.type === "startGame") {
            if (data.gameID === currentGameID)
                startGame();
        }
        if (data.type === "cancelGame") {
            if (data.gameID === currentGameID) {
                currentGameID = null;
                alert('Your opponent has left the game. Returning to menu.');
                onlineGameMenu.classList.remove("hidden");
                gameScreen.classList.add("hidden");
            }
        }
    };
});
// Go back to main menu
backToMenuBtn.addEventListener("click", () => {
    if (currentGameID) {
        socket.send(JSON.stringify({ type: "leaveGameMenu", gameID: currentGameID }));
        currentGameID = null;
    }
    onlineGameMenu.classList.add("hidden");
    mainMenu.classList.remove("hidden");
    if (socket) {
        socket.close();
        socket = null;
    }
});
// Create a new game
createGameBtn.addEventListener("click", () => {
    currentGameID = Date.now();
    socket.send(JSON.stringify({ type: "createGame", clientID, currentGameID }));
});
// Leave a game
leaveGameBtn.addEventListener("click", () => {
    if (currentGameID) {
        socket.send(JSON.stringify({ type: "leaveGame", clientID, gameID: currentGameID }));
        currentGameID = null;
    }
    gameScreen.classList.add("hidden");
    onlineGameMenu.classList.remove("hidden");
});
// Join a game
function joinGame(gameID) {
    if (currentGameID)
        return;
    socket.send(JSON.stringify({ type: "joinGame", clientID, gameID }));
    currentGameID = gameID;
}
// Start game when 2 players are in
function startGame() {
    onlineGameMenu.classList.add("hidden");
    gameScreen.classList.remove("hidden");
}
// Update game list UI
function updateGameList(games) {
    gameList.innerHTML = "";
    createGameBtn.disabled = games.length >= 5 || currentGameID !== null;
    games.forEach(game => {
        const gameBox = document.createElement("div");
        gameBox.classList.add("game-box");
        gameBox.innerHTML = `<p>Game from ${game.creator}</p><p>Players: ${game.players.length}/2</p><div class="game-actions"></div>`;
        if (game.players.length < 2 && game.creator !== clientID) {
            const joinBtn = document.createElement("button");
            joinBtn.textContent = "Join";
            joinBtn.onclick = () => joinGame(game.id);
            gameBox.querySelector('.game-actions').appendChild(joinBtn);
            if (currentGameID !== null)
                joinBtn.disabled = true;
        }
        if (game.creator === clientID) {
            const leaveBtn = document.createElement("button");
            leaveBtn.textContent = "Leave";
            leaveBtn.onclick = () => {
                socket.send(JSON.stringify({ type: "deleteGame", gameID: game.id }));
                currentGameID = null;
            };
            gameBox.querySelector('.game-actions').appendChild(leaveBtn);
        }
        gameList.appendChild(gameBox);
    });
}
export {};
