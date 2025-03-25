export class Player {
	x: number;
	y: number;
	score : number;
	paddleWidth: number;
	paddleHeight: number;
	paddleSpeed: number;

	constructor(x:number) {
		this.x = x;
		this.y = 250;
		this.score = 0;
		this.paddleWidth = 10;
		this.paddleHeight = 100;
		this.paddleSpeed = 10;

	}

	moveUp(screenHeight: number) {
		if (this.y > 0) {
		  this.y -= this.paddleSpeed;
		}
	  }

	  moveDown(screenHeight: number) {
		if (this.y + this.paddleHeight < screenHeight) {
		  this.y += this.paddleSpeed;
		}
	  }

	resetScore()
	{
		this.score = 0;
	}

	resetPos()
	{
		this.y = 50;
	}
}
