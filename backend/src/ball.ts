import { GameServiceTypes, gameSettings } from "transcendence";

export class Ball {
    x: number;
    y: number;
    prevX: number;
    prevY: number;
    speedX: number;
    speedY: number;
    radius : number;


    constructor() {
        this.prevX = 0;
        this.prevY = 0;
        this.x = 400;
        this.y = 200;
        this.speedX = 5;
        this.speedY = 3;
        this.radius = gameSettings.ballRadius;

    }

    //updates the ball's position and slightly increases its speed over time
    move() {

        this.prevX = this.x;
        this.prevX = this.x;
        this.prevY = this.y;

        this.x += this.speedX;
        this.y += this.speedY;

        const accelerationFactor = 1.0003;
        this.speedX *= accelerationFactor;
        this.speedY *= accelerationFactor;

        //cap the speed
        const maxSpeed = 10;
        this.speedX = Math.max(-maxSpeed, Math.min(this.speedX, maxSpeed));
        this.speedY = Math.max(-maxSpeed, Math.min(this.speedY, maxSpeed));
    }

    //resets the ball to the center with random trajectory
    reset() {
        this.prevX = this.x;
        this.prevY = this.y;
        this.x = gameSettings.pongTableWidth / 2;
        this.y = gameSettings.pongTableHeight / 2;

        const speed = gameSettings.ballSpeed;

        let angleDeg = Math.random() * 90 - 45;

        //Avoid very shallow angles
        if (Math.abs(angleDeg) < 15) {
            angleDeg = angleDeg < 0 ? -15 : 15;
        }

        const angleRad = angleDeg * (Math.PI / 180);

        // Randomize initial horizontal direction (left or right)
        const direction = Math.random() < 0.5 ? 1 : -1;

        this.speedX = direction * speed * Math.cos(angleRad);
        this.speedY = speed * Math.sin(angleRad);
    }


}
