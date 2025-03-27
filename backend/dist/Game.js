"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Game = void 0;
/* Game logic */
const player_1 = require("./player");
const ball_1 = require("./ball");
const transcendence_1 = require("transcendence");
const { v4: uuidv4 } = require("uuid");
class Game {
    constructor(typeOfGame, matchId, hostId, opponentId) {
        this.onGameOverCallback = null;
        this.gameLoop = () => {
            if (!this.isGameOver) {
                this.update();
                this.gameLoopId = setTimeout(this.gameLoop, 1000 / 60); // 60 FPS
            }
        };
        this.matchId = matchId;
        this.typeOfGame = typeOfGame;
        this.player1 = new player_1.Player(hostId, transcendence_1.gameSettings.paddleWidth);
        this.player2 = new player_1.Player(opponentId, transcendence_1.gameSettings.pongTableWidth - transcendence_1.gameSettings.paddleWidth);
        this.ball = new ball_1.Ball();
        this.isGameOver = true;
        this.screenWidth = transcendence_1.gameSettings.pongTableWidth;
        this.screenHeight = transcendence_1.gameSettings.pongTableHeight;
        this.gameLoopId = null;
    }
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
        // if (this.isGameOver) {
        //     console.log("Game is already stopped!");
        //     return;
        // }
        this.isGameOver = true;
        if (this.gameLoopId) {
            clearTimeout(this.gameLoopId);
            this.gameLoopId = null;
        }
        console.log("Game stopped!");
        if (this.onGameOverCallback) {
            this.onGameOverCallback(reason);
        }
    }
    update() {
        this.ball.move(this.screenWidth, this.screenHeight);
        if (this.ball.y <= 0 || this.ball.y >= this.screenHeight) {
            this.ball.speedY *= -1;
        }
        //left player
        if (this.ball.x - this.ball.radius <= this.player1.x + this.player1.paddleWidth &&
            this.ball.x + this.ball.radius >= this.player1.x &&
            this.ball.y >= this.player1.y &&
            this.ball.y <= this.player1.y + this.player1.paddleHeight) {
            this.ball.speedX *= -1;
            this.ball.x = this.player1.x + this.player1.paddleWidth + this.ball.radius;
        }
        //right player
        if (this.ball.x + this.ball.radius >= this.player2.x &&
            this.ball.x - this.ball.radius <= this.player2.x + this.player2.paddleWidth &&
            this.ball.y >= this.player2.y &&
            this.ball.y <= this.player2.y + this.player2.paddleHeight) {
            this.ball.speedX *= -1;
            this.ball.x = this.player2.x - this.ball.radius;
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
        if (this.player1.score >= transcendence_1.gameSettings.maxScore || this.player2.score >= transcendence_1.gameSettings.maxScore) {
            //   this.isGameOver = true;
            //this.stopGame();
            this.stopGame("normalMaxScoreReached");
        }
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
exports.Game = Game;
