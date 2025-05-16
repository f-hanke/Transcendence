import { GameServiceTypes, gameSettings } from "transcendence";

export class Ball {
    x: number;
    y: number;
    speedX: number;
    speedY: number;
    radius : number;


    constructor() {
        this.x = 400;
        this.y = 200;
        this.speedX = 5;
        this.speedY = 3;
        this.radius = gameSettings.ballRadius;
    }


    move(screenWidth: number, screenHeight: number) {
        this.x += this.speedX;
        this.y += this.speedY;

        const accelerationFactor = 1.0005;
        this.speedX *= accelerationFactor;
        this.speedY *= accelerationFactor;

        const maxSpeed = 15;
        this.speedX = Math.max(-maxSpeed, Math.min(this.speedX, maxSpeed));
        this.speedY = Math.max(-maxSpeed, Math.min(this.speedY, maxSpeed));
    }

    reset() {
        this.x = 400;
        this.y = 200;
        this.speedX = 2;
        this.speedY = 3;
    }
}
