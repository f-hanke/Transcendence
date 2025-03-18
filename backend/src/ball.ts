
export class Ball {
	x: number;
	y: number;
	speedX: number;
	speedY: number;
	radius : number;


	constructor() {
		this.x = 400;
		this.y = 300;
		this.speedX = 4;
		this.speedY = 3;
		this.radius = 10;
	}


	move(screenWidth: number, screenHeight: number) {
		this.x += this.speedX;
		this.y += this.speedY;
	}

	reset() {
		this.x = 400;
		this.y = 300;
		this.speedX = 4;
		this.speedY = 3;
	}
}
