import { GameServiceTypes, gameSettings } from "transcendence";

export class Player {
	x: number;
	y: number;
	score : number;
	paddleWidth: number;
	paddleHeight: number;
	paddleSpeed: number;
	//id : number;


	constructor(x:number) {
		this.x = x;
		this.y = gameSettings.paddleHeight;
		this.score = 0;
		this.paddleWidth = 10;
		this.paddleHeight = 100;
		this.paddleSpeed = 10;
		//this.id = gameSettings.
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
