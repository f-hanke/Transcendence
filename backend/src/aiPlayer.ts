// aiPlayer.ts
import { Player } from './player.js';
import { WebSocket } from 'ws';
import { Ball } from './ball.js';
import { gameSettings } from 'transcendence';

export class AIPlayer extends Player {

    private targetY: number | undefined;
    private intervalId: NodeJS.Timeout | null = null;
    private player1Score: number;
    private aiScore: number;

    constructor(id: string, x: number) {
        super(id, x);
        this.player1Score = 0;
        this.aiScore = 0;
    }


    startAI(ball: Ball, ) {
        if (this.intervalId !== null) {
        clearInterval(this.intervalId);
        }
        this.intervalId = setInterval(() => {
        this.updateTarget(ball);
        }, 1000);
    }

    stopAI() {
        if (this.intervalId !== null) {
        clearInterval(this.intervalId);
        this.intervalId = null;
        }
    }

    updateTarget(ball: Ball)
    {
        if (ball.speedX <= 0) {
            this.targetY =gameSettings.pongTableHeight/2 ;
            return;
        }

        if (Math.random() < 0.20) {
            return;
        }

        let remainingTime = (this.x - ball.x) / ball.speedX;
        let simulatedY = ball.y;
        let simulatedSpeedY = ball.speedY;
        const tableHeight = gameSettings.pongTableHeight;

        while (remainingTime > 0)
        {
            let timeToTop = (0 - simulatedY) / simulatedSpeedY;
            let timeToBottom = (tableHeight - simulatedY) / simulatedSpeedY;

            let timeToWall;
            if (simulatedSpeedY < 0) {
                timeToWall = timeToTop;
            } else {
                timeToWall = timeToBottom;
            }
            if (timeToWall < remainingTime) {
                simulatedY += simulatedSpeedY * timeToWall;
                remainingTime -= timeToWall;
                simulatedSpeedY *= -1;
            } else {
                simulatedY += simulatedSpeedY * remainingTime;
                remainingTime = 0;
            }
        }


        this.targetY = Math.max(this.paddleHeight / 2, Math.min(simulatedY, tableHeight - this.paddleHeight / 2));

        console.log("Target with bounce:", this.targetY);
        this.adaptBehaviorToScore(this.player1Score, this.aiScore);



    }

    simulateKeyPress(direction: 'up' | 'down' | 'none') {
        switch (direction) {
            case 'up':
                this.paddleSpeed = -gameSettings.paddleSpeed;
                break;
            case 'down':
                this.paddleSpeed = gameSettings.paddleSpeed;
                break;
            case 'none':
            default:
                this.paddleSpeed = 0;
                break;
        }
    }

    adaptBehaviorToScore(player1Score: number, aiScore: number)
    {
        // Adds more or less error to the AI's target depending on the current score
        if (this.targetY === undefined) return;

        const scoreDiff = aiScore - player1Score;


        let errorRange = 100;

        if (scoreDiff >= 3) {
            errorRange = 150;
        } else if (scoreDiff <= -2) {
            errorRange = 50;
        }
        else {
            errorRange = 70;
        }

        let simulatedY = this.targetY;
        const error = (Math.random() - 0.5) * errorRange;
        this.targetY = Math.max(this.paddleHeight / 2, Math.min(simulatedY + error, gameSettings.pongTableHeight - this.paddleHeight / 2));

        console.log("Target with score adapt:", this.targetY);

    }

    updateAI(player1Score: number, aiScore: number) {


        if (this.targetY === undefined) {
            return;
        }

        this.player1Score = player1Score;
        this.aiScore = aiScore;


        const buffer = 4;
        if (this.y < this.targetY - buffer) {
            this.simulateKeyPress('down');
        } else if (this.y > this.targetY + buffer) {
            this.simulateKeyPress('up');
        } else {
            this.simulateKeyPress('none');
        }

        this.y += this.paddleSpeed;

        this.y = Math.max(this.paddleHeight / 2, Math.min(this.y, gameSettings.pongTableHeight - this.paddleHeight / 2));
    }

}
