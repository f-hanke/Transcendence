"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Player = void 0;
const transcendence_1 = require("transcendence");
class Player {
    /*Something to do with the position */
    constructor(id, y) {
        this.id = id;
        this.x = 10; //not correct
        this.y = transcendence_1.gameSettings.playerYStart; //not correct
        this.score = 0;
        this.paddleWidth = transcendence_1.gameSettings.paddleWidth;
        this.paddleHeight = transcendence_1.gameSettings.paddleHeight;
        this.paddleSpeed = transcendence_1.gameSettings.paddleSpeed;
    }
    moveUp() {
        if (this.y > 0) {
            this.y -= this.paddleSpeed;
        }
    }
    moveDown(screenHeight) {
        if (this.y + this.paddleHeight < screenHeight) {
            this.y += this.paddleSpeed;
        }
    }
    resetScore() {
        this.score = 0;
    }
    resetPos() {
        this.y = transcendence_1.gameSettings.paddleHeight;
    }
}
exports.Player = Player;
