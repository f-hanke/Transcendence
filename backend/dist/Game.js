"use strict";
/* Game logic */
Object.defineProperty(exports, "__esModule", { value: true });
exports.Game = void 0;
const player_1 = require("./player");
const ball_1 = require("./ball");
class Game {
    constructor(screenWidth, screenHeight) {
        this.player1 = new player_1.Player(10);
        this.player2 = new player_1.Player(screenWidth - 20);
        this.ball = new ball_1.Ball();
        this.isGameOver = false;
        this.screenWidth = screenWidth;
        this.screenHeight = screenHeight;
    }
    startGame() {
        console.log("Game started!");
        this.isGameOver = false;
        this.player1.score = 0;
        this.player2.score = 0;
        this.ball.reset();
        const gameLoop = () => {
            if (!this.isGameOver) {
                this.update();
                setTimeout(gameLoop, 1000 / 60); // 60 FPS
            }
        };
        gameLoop();
    }
    update() {
        this.ball.move(this.screenWidth, this.screenHeight);
        if (this.ball.y <= 0 || this.ball.y >= this.screenHeight) {
            this.ball.speedY *= -1; // Inverse la direction verticale
        }
        //left player
        if (this.ball.x <= this.player1.x + this.player1.paddleWidth &&
            this.ball.y >= this.player1.y &&
            this.ball.y <= this.player1.y + this.player1.paddleHeight) {
            this.ball.speedX *= -1;
        }
        //right player
        if (this.ball.x + this.ball.radius >= this.player2.x &&
            this.ball.y >= this.player2.y &&
            this.ball.y <= this.player2.y + this.player2.paddleHeight) {
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
        //10 points to win
        if (this.player1.score >= 10 || this.player2.score >= 10) {
            this.isGameOver = true;
        }
    }
}
exports.Game = Game;
