/* Game logic */

import { Player } from './player';
import { Ball } from './ball';

export class Game {
	player1: Player;
	player2: Player;
	ball: Ball;
	isGameOver: boolean;
	screenWidth: number;
	screenHeight: number;

	constructor(screenWidth: number, screenHeight: number) {
		this.player1 = new Player(10);
		this.player2 = new Player(screenWidth - 20);
		this.ball = new Ball();
		this.isGameOver = false;
		this.screenWidth = screenWidth;
		this.screenHeight = screenHeight;
	}

	update() {
		this.ball.move(this.screenWidth, this.screenHeight);
	}
}
