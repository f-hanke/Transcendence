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
        this.speedX = 2;
        this.speedY = Math.round(Math.random() * 3);
        this.radius = gameSettings.ballRadius;
    }
    move(screenWidth, screenHeight) {
        this.x += this.speedX;
        this.y += this.speedY;
    }
    reset() {
        this.x = 400;
        this.y = 200;
        this.speedX = 2;
        this.speedY = Math.round(Math.random() * 3);
    }
}
