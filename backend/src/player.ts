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
	constructor(id:string, x:number) {
		this.id = id;
		this.x = x;
		this.y = gameSettings.playerYStart;
		this.score = 0;
		this.paddleWidth = gameSettings.paddleWidth;
		this.paddleHeight = gameSettings.paddleHeight;
		this.paddleSpeed = gameSettings.paddleSpeed;
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
