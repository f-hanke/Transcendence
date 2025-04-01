import { GameState } from "../../state/gameStateTypes";
import { gameSettings } from "transcendence";

class DrawPongTable {
  ctx: CanvasRenderingContext2D;
  gameState: GameState;
  constructor(ctx: CanvasRenderingContext2D) {
    this.ctx = ctx;
    this.gameState = window.store.gameStore.get();
  }

  draw() {
    this.gameState = window.store.gameStore.get();
    this.clearCanvas();
    this.drawBackground();
    this.drawCenterLine();
    this.drawBumpers();
    this.drawBall();
    this.drawPaddles();
  }

  clearCanvas() {
    this.ctx.clearRect(0, 0, gameSettings.pongTableWidth, gameSettings.canvasHeight);
  }

  drawBackground() {
    this.ctx.fillStyle = "black";
    this.ctx.fillRect(0, 0, gameSettings.pongTableWidth, gameSettings.canvasHeight);
  }

  drawCenterLine() {
    this.ctx.strokeStyle = "white";
    this.ctx.lineWidth = gameSettings.bumperHeight;
    this.ctx.setLineDash([10, 10]);
    this.ctx.beginPath();
    this.ctx.moveTo(gameSettings.pongTableWidth / 2, 0);
    this.ctx.lineTo(
      gameSettings.pongTableWidth / 2,
      gameSettings.canvasHeight
    );
    this.ctx.stroke();
    this.ctx.setLineDash([]);
  }

  drawBumpers() {
    this.ctx.fillStyle = "white";
    this.ctx.fillRect(
      gameSettings.paddleWidth,
      0,
      gameSettings.pongTableWidth - gameSettings.paddleWidth * 2,
      gameSettings.bumperHeight
    );
    this.ctx.fillRect(
      gameSettings.paddleWidth,
      gameSettings.canvasHeight - gameSettings.bumperHeight,
      gameSettings.pongTableWidth - gameSettings.paddleWidth * 2,
      gameSettings.bumperHeight
    );
  }

  drawBall() {
    this.ctx.fillStyle = "white";
    this.ctx.beginPath();
    this.ctx.arc(
      this.gameState.ball.x,
      this.gameState.ball.y,
      gameSettings.ballRadius,
      0,
      Math.PI * 2
    );
    this.ctx.fill();
  }

  drawPaddles() {
    this.ctx.fillStyle = "white";
    this.ctx.fillRect(
      0,
      this.gameState.paddleLeft.paddleY - gameSettings.paddleHeight / 2,
      gameSettings.paddleWidth,
      gameSettings.paddleHeight
    );
    this.ctx.fillRect(
      gameSettings.pongTableWidth - gameSettings.paddleWidth,
      this.gameState.paddleRight.paddleY - gameSettings.paddleHeight / 2,
      gameSettings.paddleWidth,
      gameSettings.paddleHeight
    );
  }
}

export { DrawPongTable };
