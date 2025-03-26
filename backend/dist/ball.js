"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Ball = void 0;
const transcendence_1 = require("transcendence");
class Ball {
    constructor() {
        this.x = 400;
        this.y = 300;
        this.speedX = 2;
        this.speedY = 3;
        this.radius = transcendence_1.gameSettings.ballRadius;
    }
    move(screenWidth, screenHeight) {
        this.x += this.speedX;
        this.y += this.speedY;
    }
    reset() {
        this.x = 400;
        this.y = 300;
        this.speedX = 2;
        this.speedY = 3;
    }
}
exports.Ball = Ball;
