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
		this.speedX = 2;
		this.speedY = Math.round(Math.random() * 3);
		this.radius = gameSettings.ballRadius;
	}


	move(screenWidth: number, screenHeight: number) {
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
