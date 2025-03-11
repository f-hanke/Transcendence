"use strict";
/* Game logic */
Object.defineProperty(exports, "__esModule", { value: true });
exports.Game = void 0;
var player_1 = require("./player");
var ball_1 = require("./ball");
var Game = /** @class */ (function () {
    function Game(screenWidth, screenHeight) {
        this.player1 = new player_1.Player(10);
        this.player2 = new player_1.Player(screenWidth - 20);
        this.ball = new ball_1.Ball();
        this.isGameOver = false;
        this.screenWidth = screenWidth;
        this.screenHeight = screenHeight;
    }
    Game.prototype.update = function () {
        this.ball.move(this.screenWidth, this.screenHeight);
    };
    return Game;
}());
exports.Game = Game;
