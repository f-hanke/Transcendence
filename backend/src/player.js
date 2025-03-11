"use strict";
/*
Maybe need to define the limit of the screen
paddle ?

Moving up and down along the y axis, in the accorded limits (careful to include the paddle height, where does the pos of the paddle starts)
*/
Object.defineProperty(exports, "__esModule", { value: true });
exports.Player = void 0;
var Player = /** @class */ (function () {
    //paddle width and height??
    function Player(x) {
        this.x = x;
        this.y = 250;
        this.score = 0;
        this.paddleWidth = 10;
        this.paddleHeight = 100;
        this.paddleSpeed = 5;
    }
    Player.prototype.moveUp = function () {
        var borderUp = 600;
        if (this.y + this.paddleSpeed < borderUp) {
            this.y += this.paddleSpeed;
        }
    };
    Player.prototype.moveDown = function () {
        var borderDown = 0;
        if (this.y > borderDown) {
            this.y -= this.paddleSpeed;
        }
    };
    Player.prototype.reset = function () {
        this.y = 50;
    };
    return Player;
}());
exports.Player = Player;
