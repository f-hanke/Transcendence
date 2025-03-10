export class Ball {
	x: number;
	y: number;
	speedx: number;
	speedy: number;
	//radius?


	constructor() {
		this.x = 0;
		this.y = 0;
		this.speedx = 0;
		this.speedy = 0;
	}


	//carefull about the borders
	move() {


	}

	reset() {
		this.x = 0;
		this.y = 0;
		this.speedx = 0;
		this.speedy = 0;
	}
}
