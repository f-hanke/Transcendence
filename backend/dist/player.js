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
        this.paddleSpeed = 5;
    }
    moveUp() {
        //will need to change this if we want the rescaling
        const borderUp = 600;
        if (this.y + this.paddleSpeed < borderUp) {
            this.y += this.paddleSpeed;
        }
    }
    moveDown() {
        const borderDown = 0;
        if (this.y > borderDown) {
            this.y -= this.paddleSpeed;
        }
    }
    reset() {
        this.y = 50;
    }
}
exports.Player = Player;
