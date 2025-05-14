// aiPlayer.ts
import { Player } from './player.js';
import { WebSocket } from 'ws';
import { Ball } from './ball.js';
import { gameSettings } from 'transcendence';

export class AIPlayer extends Player {

	private targetY: number | undefined;
    private intervalId: NodeJS.Timeout | null = null;

	constructor(id: string, x: number) {
		super(id, x);

	}



	startAI(ball: Ball) {
		if (this.intervalId !== null) {
		clearInterval(this.intervalId);
		}
		this.intervalId = setInterval(() => {
		this.updateTarget(ball);
		//this.updateAI(ball);
		}, 1000);  // Actualisation de l'IA toutes les secondes
	}

	stopAI() {
		if (this.intervalId !== null) {
		clearInterval(this.intervalId);
		this.intervalId = null;
		}
	}

	updateTarget(ball:Ball)
	{
		//calculate hitting ball position aka the target
		//should be updated everysecond


		console.log("Update target");
		//if goes to the left, we don't care
		if (ball.speedX <= 0) {
			this.targetY =gameSettings.pongTableHeight/2 ;
			return;
		}

		const timeToHitLeftSide = (this.x - ball.x) / ball.speedX;
		const predictedY = ball.y + ball.speedY * timeToHitLeftSide;


		const targetY = Math.max(
			this.paddleHeight / 2,
			Math.min(predictedY, gameSettings.pongTableHeight - this.paddleHeight / 2)
		);

		this.targetY = targetY;
		console.log("Target is : ", targetY);

	}

	updateAI()
	 {
		//update the AI position like a human
		//is called more than everysecond

		if (this.targetY === undefined || this.targetY  == 93.5) {
			//console.log("target undefined");
			return;
		}


		const movementSpeed = gameSettings.paddleSpeed;

		if (this.y < this.targetY) {
			this.paddleSpeed = movementSpeed;
		} else if (this.y > this.targetY) {
			this.paddleSpeed = -movementSpeed;
		} else {
			this.paddleSpeed = 0;
		}

		this.y += this.paddleSpeed;

		this.y = Math.max(this.paddleHeight / 2, Math.min(this.y, gameSettings.pongTableHeight - this.paddleHeight / 2));
	}

}
