"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Ball = void 0;
var Ball = /** @class */ (function () {
    function Ball() {
        this.x = 400;
        this.y = 300;
        this.speedX = 4;
        this.speedY = 3;
        this.radius = 10;
    }
    Ball.prototype.move = function (screenWidth, screenHeight) {
        this.x += this.speedX;
        this.y += this.speedY;
        if (this.y - this.radius <= 0 || this.y + this.radius >= screenHeight) {
            this.speedY *= -1; // Inverser la direction verticale
        }
    };
    Ball.prototype.reset = function () {
        this.x = 400;
        this.y = 300;
        this.speedX = 4;
        this.speedY = 3;
    };
    return Ball;
}());
exports.Ball = Ball;
