import { GameServiceTypes, gameSettings } from "transcendence";

export class Player {
	x: number;
	y: number;
	score : number;
	paddleWidth: number;
	paddleHeight: number;
	paddleSpeed: number;
	id: string;


	/*Something to do with the position */
	constructor(id:string, y:number) {
		this.id = id;
		this.x = 10; //not correct
		this.y = gameSettings.playerYStart; //not correct
		this.score = 0;
		this.paddleWidth = gameSettings.paddleWidth;
		this.paddleHeight = gameSettings.paddleHeight;
		this.paddleSpeed = gameSettings.paddleSpeed;
	}


	moveUp() {
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
		this.y = gameSettings.paddleHeight;
	}
}
