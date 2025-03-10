/* Game logic */

import { Player } from './player';
import { Ball } from './ball';

export class Game {
	player1: Player;
	player2: Player;
	ball: Ball;
	isGameOver: boolean;

	constructor() {
		this.player1 = new Player();
		this.player2 = new Player();
		this.ball = new Ball();
		this.isGameOver = false;
	}
}
