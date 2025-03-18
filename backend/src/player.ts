export class Player {
	x: number;
	y: number;
	score : number;
	paddleWidth: number;
	paddleHeight: number;
	paddleSpeed: number;

	//paddle width and height??

	constructor(x:number) {
		this.x = x;
		this.y = 250;
		this.score = 0;
		this.paddleWidth = 10;
		this.paddleHeight = 100;
		this.paddleSpeed = 5;

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


	reset()
	{
		this.y = 50;
	}
}
