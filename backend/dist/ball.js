import { gameSettings } from "transcendence";
export class Ball {
    x;
    y;
    speedX;
    speedY;
    radius;
    constructor() {
        this.x = 400;
        this.y = 200;
        this.speedX = 5;
        this.speedY = 0;
        this.radius = gameSettings.ballRadius;
    }
    move(screenWidth, screenHeight) {
        this.x += this.speedX;
        this.y += this.speedY;
    }
    reset() {
        this.x = 400;
        this.y = 200;
        this.speedX = 5;
        this.speedY = 0;
    }
}
