//sreens
var mainMenu = document.getElementById("main-menu");
var onlineGameMenu = document.getElementById("online-game-menu");
var gameScreen = document.getElementById("game-screen");
//buttons
var onlineGameBtn = document.getElementById("online-game");
var createGameBtn = document.getElementById("create-game");
var backToMenuBtn = document.getElementById("back-to-menu");
var leaveGameBtn = document.getElementById("leave-game");
var gameList = document.getElementById("game-list");
var currentGameID = null;
var socket = null;
var clientID;
// Switch to online game menu
onlineGameBtn.addEventListener("click", function () {
    socket = new WebSocket("ws://localhost:3000");
    clientID = "player-".concat(Math.floor(Math.random() * 10000));
    mainMenu.classList.add("hidden");
    onlineGameMenu.classList.remove("hidden");
    socket.onopen = function () {
        console.log("Connected to server");
        socket.send(JSON.stringify({ type: "connect", clientID: clientID }));
    };
    socket.onmessage = function (event) {
        var data = JSON.parse(event.data);
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
backToMenuBtn.addEventListener("click", function () {
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
createGameBtn.addEventListener("click", function () {
    currentGameID = Date.now();
    socket.send(JSON.stringify({ type: "createGame", clientID: clientID, currentGameID: currentGameID }));
});
// Leave a game
leaveGameBtn.addEventListener("click", function () {
    if (currentGameID) {
        socket.send(JSON.stringify({ type: "leaveGame", clientID: clientID, gameID: currentGameID }));
        currentGameID = null;
    }
    gameScreen.classList.add("hidden");
    onlineGameMenu.classList.remove("hidden");
});
// Join a game
function joinGame(gameID) {
    if (currentGameID)
        return;
    socket.send(JSON.stringify({ type: "joinGame", clientID: clientID, gameID: gameID }));
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
    games.forEach(function (game) {
        var gameBox = document.createElement("div");
        gameBox.classList.add("game-box");
        gameBox.innerHTML = "<p>Game from ".concat(game.creator, "</p><p>Players: ").concat(game.players.length, "/2</p><div class=\"game-actions\"></div>");
        if (game.players.length < 2 && game.creator !== clientID) {
            var joinBtn = document.createElement("button");
            joinBtn.textContent = "Join";
            joinBtn.onclick = function () { return joinGame(game.id); };
            gameBox.querySelector('.game-actions').appendChild(joinBtn);
            if (currentGameID !== null)
                joinBtn.disabled = true;
        }
        if (game.creator === clientID) {
            var leaveBtn = document.createElement("button");
            leaveBtn.textContent = "Leave";
            leaveBtn.onclick = function () {
                socket.send(JSON.stringify({ type: "deleteGame", gameID: game.id }));
                currentGameID = null;
            };
            gameBox.querySelector('.game-actions').appendChild(leaveBtn);
        }
        gameList.appendChild(gameBox);
    });
}
