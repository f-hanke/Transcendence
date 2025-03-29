import { gameSettings } from "transcendence";
export class Player {
    x;
    y;
    score;
    paddleWidth;
    paddleHeight;
    paddleSpeed;
    id;
    /*Something to do with the position */
    constructor(id, y) {
        this.id = id;
        this.x = 10; //not correct
        this.y = gameSettings.playerYStart;
        this.score = 0;
        this.paddleWidth = gameSettings.paddleWidth;
        this.paddleHeight = gameSettings.paddleHeight;
        this.paddleSpeed = gameSettings.paddleSpeed;
    }
    resetScore() {
        this.score = 0;
    }
    resetPos() {
        this.y = gameSettings.paddleHeight;
    }
}
