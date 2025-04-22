/* Game logic */
import { Player } from './player.js';
import { Ball } from './ball.js';
import { gameSettings } from 'transcendence';
import { sendMessage } from './server.js';
export class Game {
    typeOfGame;
    websocketplayer1;
    websocketplayer2;
    websocket;
    remoteWebsockets;
    matchId;
    player1;
    player2;
    ball;
    isGameOver;
    screenWidth;
    screenHeight;
    gameLoopId;
    onGameOverCallback = null;
    constructor(typeOfGame, matchId, hostId, opponentId) {
        this.websocketplayer1 = null;
        this.websocketplayer2 = null;
        this.websocket = null;
        this.matchId = matchId;
        this.typeOfGame = typeOfGame;
        this.player1 = new Player(hostId, gameSettings.player1XStart);
        this.player2 = new Player(opponentId, gameSettings.player2XStart);
        this.ball = new Ball();
        this.isGameOver = true;
        this.screenWidth = gameSettings.pongTableWidth;
        this.screenHeight = gameSettings.pongTableHeight;
        this.gameLoopId = null;
        this.remoteWebsockets = null;
    }
    gameLoop = () => {
        // console.log(this.remoteWebsockets?.get(this.player1.id));
        // console.log(this.remoteWebsockets?.get(this.player2.id));
        if (!this.isGameOver) {
            const gameStateMsgNew = {
                type: "serverUpdateGameState",
                data: {
                    ball: {
                        x: this.ball.x,
                        y: this.ball.y,
                    },
                    matchId: this.matchId,
                    player1: {
                        id: this.player1.id,
                        paddleY: this.player1.y,
                        score: this.player1.score,
                    },
                    player2: {
                        id: this.player2.id,
                        paddleY: this.player2.y,
                        score: this.player2.score,
                    }
                }
            };
            this.update();
            if (this.typeOfGame == 'remote') {
                sendMessage(this.websocketplayer1, gameStateMsgNew);
                sendMessage(this.websocketplayer2, gameStateMsgNew);
            }
            else {
                sendMessage(this.websocket, gameStateMsgNew);
            }
            this.gameLoopId = setTimeout(this.gameLoop, 1000 / 60); // 60 FPS
        }
    };
    startGame() {
        if (!this.isGameOver) {
            console.log("Game already running!");
            return;
        }
        console.log("Game started!");
        this.isGameOver = false;
        this.player1.score = 0;
        this.player2.score = 0;
        this.ball.reset();
        this.gameLoop();
    }
    stopGame(reason) {
        if (this.isGameOver) {
            console.log("Game is already stopped!");
            return;
        }
        this.isGameOver = true;
        if (this.gameLoopId) {
            clearTimeout(this.gameLoopId);
            this.gameLoopId = null;
        }
        console.log("Game stopped!");
        if (this.onGameOverCallback) {
            this.onGameOverCallback(reason);
        }
        sendMessage(this.websocket, {
            type: "serverGameIsOver",
            data: {
                matchId: this.matchId,
                player1: {
                    id: this.player1.id,
                    score: this.player1.score,
                },
                player2: {
                    id: this.player2.id,
                    score: this.player2.score,
                },
                reason: reason,
            }
        });
    }
    updatePaddlePosition(data) {
        this.player1.y = data.player1.paddleY;
        this.player1.paddleSpeed = data.player1.paddleSpeed;
        this.player2.y = data.player2.paddleY;
        this.player2.paddleSpeed = data.player2.paddleSpeed;
    }
    updatePaddlePositionRemote(data) {
        if (data.player1.playerId == this.player1.id) {
            this.player1.y = data.player1.paddleY;
            this.player1.paddleSpeed = data.player1.paddleSpeed;
        }
        else {
            this.player2.y = data.player1.paddleY;
            this.player2.paddleSpeed = data.player1.paddleSpeed;
        }
    }
    update() {
        this.ball.move(this.screenWidth, this.screenHeight);
        if (this.ball.y <= 0 || this.ball.y >= this.screenHeight) {
            this.ball.speedY *= -1;
        }
        //left player
        if (this.ball.x + this.ball.radius <= this.player1.x + this.player1.paddleWidth &&
            this.ball.y <= this.player1.y + this.player1.paddleHeight / 2 &&
            this.ball.y >= this.player1.y - this.player1.paddleHeight / 2) {
            if ((this.player1.paddleSpeed > 0 && this.ball.speedY > 0)
                || (this.player2.paddleSpeed < 0 && this.ball.speedY < 0))
                this.ball.speedY *= 1.5;
            if ((this.player1.paddleSpeed > 0 && this.ball.speedY < 0) ||
                (this.player1.paddleSpeed < 0 && this.ball.speedY > 0))
                this.ball.speedY *= 0.5;
            this.ball.speedX *= -1;
        }
        //right player
        if (this.player2.x - this.player2.paddleWidth / 2 <= this.ball.x + this.ball.radius &&
            this.ball.y <= this.player2.y + this.player2.paddleHeight / 2 &&
            this.ball.y >= this.player2.y - this.player2.paddleHeight / 2) {
            if ((this.player2.paddleSpeed > 0 && this.ball.speedY > 0)
                || (this.player2.paddleSpeed < 0 && this.ball.speedY < 0))
                this.ball.speedY *= 14.5;
            if ((this.player2.paddleSpeed > 0 && this.ball.speedY < 0) ||
                (this.player2.paddleSpeed < 0 && this.ball.speedY > 0))
                this.ball.speedY *= 14.5;
            this.ball.speedX *= -1;
        }
        if (this.ball.x <= 0) {
            this.player2.score += 1;
            console.log(`Player 1 score: ${this.player1.score}, Player 2 score: ${this.player2.score}`);
            this.ball.reset();
        }
        if (this.ball.x >= this.screenWidth) {
            this.player1.score += 1;
            console.log(`Player 1 score: ${this.player1.score}, Player 2 score: ${this.player2.score}`);
            this.ball.reset();
        }
        if (this.player1.score >= gameSettings.maxScore || this.player2.score >= gameSettings.maxScore)
            this.stopGame("normalMaxScoreReached");
    }
    resetGame() {
        this.isGameOver = false;
        this.ball.reset();
        this.player1.resetScore();
        this.player2.resetScore();
        this.player1.resetPos();
        this.player2.resetPos();
    }
}
