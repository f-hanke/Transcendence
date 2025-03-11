"use strict";
/*
Maybe need to define the limit of the screen
paddle ?

Moving up and down along the y axis, in the accorded limits (careful to include the paddle height, where does the pos of the paddle starts)
*/
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
