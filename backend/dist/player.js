"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Player = void 0;
const transcendence_1 = require("transcendence");
class Player {
    //id : number;
    constructor(x) {
        this.x = x;
        this.y = transcendence_1.gameSettings.paddleHeight;
        this.score = 0;
        this.paddleWidth = 10;
        this.paddleHeight = 100;
        this.paddleSpeed = 10;
        //this.id = gameSettings.
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
