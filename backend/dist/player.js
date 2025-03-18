"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Player = void 0;
class Player {
    //paddle width and height??
    constructor(x) {
        this.x = x;
        this.y = 250;
        this.score = 0;
        this.paddleWidth = 10;
        this.paddleHeight = 100;
        this.paddleSpeed = 10;
    }
    moveUp(screenHeight) {
        if (this.y > 0) {
            this.y -= this.paddleSpeed;
        }
    }
    moveDown(screenHeight) {
        if (this.y + this.paddleHeight < screenHeight) {
            this.y += this.paddleSpeed;
        }
    }
    reset() {
        this.y = 50;
    }
}
exports.Player = Player;
