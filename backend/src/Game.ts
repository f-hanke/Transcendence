/* Game logic */
import { Player } from "./player.js";
import { Ball } from "./ball.js";
import {
  gameResultTypeGuards,
  GameResultTypes,
  GameServiceTypes,
  gameSettings,
} from "transcendence";
import { WebSocket } from "ws";
import amqp from "amqplib";
import { sendMessage } from "./server.js";
import { AIPlayer } from "./aiPlayer.js";
import chalk from "chalk";

const queue = "game-service-queue";

async function publishMatchResult(message: GameResultTypes.MatchResult) {
  if (!gameResultTypeGuards.isMatchResult(message))
    console.error("Trying to publish unknown type");
  // const connection = await amqp.connect(
  //   `amqp://${process.env.RABBITMQ_HOST || "localhost"}`
  // );
  let connection;
  try {
		connection = await amqp.connect('amqp://admin:admin@rabbitmq-service:5672');
    console.log("Connected to amqp://admin:admin@rabbitmq-service:5672");
	} catch (err) {
		console.warn('Failed to connect to rabbitmq-service, trying localhost...');
		connection = await amqp.connect('amqp://localhost');
	}
  const channel = await connection.createChannel();

  await channel.assertQueue(queue, { durable: true });

  channel.sendToQueue(queue, Buffer.from(JSON.stringify(message)));
  console.log("[Publisher] Sent:", message);
}

export class Game {
  typeOfGame: GameServiceTypes.StaticGameProperties["typeOfGame"];
  websocketplayer1: WebSocket | null;
  websocketplayer2: WebSocket | null;
  websocket: WebSocket | null;
  remoteWebsockets: Map<string, WebSocket> | null;
  matchId: string;
  player1: Player;
  player2: Player | AIPlayer;
  ball: Ball;
  isGameOver: boolean;
  screenWidth: number;
  screenHeight: number;
  gameLoopId: NodeJS.Timeout | null;
// commented by Steffen not needed? is never defined
//   onGameOverCallback:
//     | ((reason: GameServiceTypes.PossibleGameEnds) => void)
//     | null = null;

  constructor(
    typeOfGame: GameServiceTypes.StaticGameProperties["typeOfGame"],
    matchId: string,
    hostId: string,
    opponentId: string
  ) {
    this.websocketplayer1 = null;
    this.websocketplayer2 = null;
    this.websocket = null;
    this.matchId = matchId;
    this.typeOfGame = typeOfGame;
    this.player1 = new Player(hostId, gameSettings.player1XStart);
    if (this.typeOfGame === "localPvAi")
      this.player2 = new AIPlayer(opponentId, gameSettings.player2XStart);
    else this.player2 = new Player(opponentId, gameSettings.player2XStart);
    this.ball = new Ball();
    this.isGameOver = true;
    this.screenWidth = gameSettings.pongTableWidth;
    this.screenHeight = gameSettings.pongTableHeight;
    this.gameLoopId = null;
    this.remoteWebsockets = null;
  }

  gameLoop = () => {
    if (!this.isGameOver) {
      const gameStateMsgNew: GameServiceTypes.ServerUpdateGameState = {
        type: "serverUpdateGameState",
        data: {
          ball: {
            x: this.ball.x,
            y: this.ball.y,
          },
          matchId: this.matchId,
          player1: {
            id: this.player1.id,
            paddleY: this.player1.y,
            score: this.player1.score,
          },
          player2: {
            id: this.player2.id,
            paddleY: this.player2.y,
            score: this.player2.score,
          },
        },
      };
      this.update();
      if (this.typeOfGame == "remote") {
        sendMessage(this.websocketplayer1 as WebSocket, gameStateMsgNew);
        sendMessage(this.websocketplayer2 as WebSocket, gameStateMsgNew);
      } else {
        sendMessage(this.websocket as WebSocket, gameStateMsgNew);
      }

      this.gameLoopId = setTimeout(this.gameLoop, 1000 / 60); // 60 FPS
    }
  };

  startGame() {
    if (!this.isGameOver) {
      console.log("Game already running!");
      return;
    }

    console.log("Game started!");
    this.isGameOver = false;
    this.player1.score = 0;
    this.player2.score = 0;
    this.ball.reset();

    if (this.typeOfGame === "localPvAi" && this.player2 instanceof AIPlayer) {
      this.player2.startAI(this.ball);
    }
    this.gameLoop();
  }

  cancelGame(){
    console.log("Enterring cancel game");
    if (this.isGameOver) {
      console.log("Game is already stopped!");
      return;
    }

    this.isGameOver = true;
    if (this.gameLoopId) {
      clearTimeout(this.gameLoopId);
      this.gameLoopId = null;
    }
  }

  stopGame(
    reason: GameServiceTypes.PossibleGameEnds,
    playerWhoLeft: null | string = null
  ) {
    if (this.isGameOver) {
      console.log("Game is already stopped!");
      return;
    }

    this.isGameOver = true;

    if (this.gameLoopId) {
      clearTimeout(this.gameLoopId);
      this.gameLoopId = null;
    }

    if (this.typeOfGame === "localPvAi" && this.player2 instanceof AIPlayer) {
      this.player2.stopAI();
    }

    console.log("Game stopped!");

    if (
      ["playerDisconnected", "playerLeftGame"].includes(reason) &&
      this.typeOfGame == "remote"
    ) {
      if (!playerWhoLeft){
        console.log("Player Who left was not defined!");
      }
      else {
        const player1Disconnected = playerWhoLeft == this.player1.id;
        const player2Disconnected = playerWhoLeft == this.player2.id;
        this.player1.score = player1Disconnected ? 0 : gameSettings.maxScore;
        this.player2.score = player2Disconnected ? 0 : gameSettings.maxScore;
      }
    }

    const gameOverMsg: GameServiceTypes.ServerGameIsOver = {
      type: "serverGameIsOver",
      data: {
        matchId: this.matchId,
        player1: {
          id: this.player1.id,
          score: this.player1.score,
        },
        player2: {
          id: this.player2.id,
          score: this.player2.score,
        },
        reason: reason,
      },
    };

    if (this.typeOfGame == "remote") {
      sendMessage(this.websocketplayer1 as WebSocket, gameOverMsg);
      sendMessage(this.websocketplayer2 as WebSocket, gameOverMsg);
    } else {
      sendMessage(this.websocket as WebSocket, gameOverMsg);
    }

    let date = new Date();
    let sqllite_date = date.toISOString();

    let id_win =
      this.player1.score > this.player2.score
        ? this.player1.id
        : this.player2.id;

    publishMatchResult({
      matchId: this.matchId,
      player1Id: this.player1.id,
      player2Id: this.player2.id,
      player1Score: this.player1.score,
      player2Score: this.player2.score,
      winnerId: id_win,
      createdAt: sqllite_date,
    }).catch((err) => {
      console.error("Failed to publish match result:", err);
    });
  }

  updatePaddlePosition(data: GameServiceTypes.DataClientUpdatePaddlePosition) {
    this.player1.y = data.player1.paddleY - gameSettings.bumperHeight;
    this.player1.paddleSpeed = data.player1.paddleSpeed;
    if (this.typeOfGame === "localPvP") {
      this.player2.y = data.player2!.paddleY - gameSettings.bumperHeight;
      this.player2.paddleSpeed = data.player2!.paddleSpeed;
    }
  }

  updateScore(player1score: number, player2score: number) {
    this.player1.score = player1score;
    this.player2.score = player2score;
  }

  updatePaddlePositionRestAPI(
    data: GameServiceTypes.DataClientUpdatePaddlePosition,
    player: number
  ) {
    if (player === 1) {
      this.player1.y = data.player1.paddleY;
    } else if (player === 2 && data.player2 !== null) {
      this.player2.y = data.player2.paddleY;
    }

    if (!this.isGameOver) {
      const gameStateMsgNew: GameServiceTypes.serverUpdateGameStateRestAPI = {
        type: "serverUpdateGameStateRestAPI",
        data: {
          ball: {
            x: this.ball.x,
            y: this.ball.y,
          },
          matchId: this.matchId,
          player1: {
            id: this.player1.id,
            paddleY: this.player1.y,
            score: this.player1.score,
          },
          player2: {
            id: this.player2.id,
            paddleY: this.player2.y,
            score: this.player2.score,
          },
        },
      };

      if (this.typeOfGame == "remote") {
        sendMessage(this.websocketplayer1 as WebSocket, gameStateMsgNew);
        sendMessage(this.websocketplayer2 as WebSocket, gameStateMsgNew);
      } else {
        sendMessage(this.websocket as WebSocket, gameStateMsgNew);
      }
    }
  }

  updatePaddlePositionRemote(
    data: GameServiceTypes.DataClientUpdatePaddlePosition
  ) {
    if (data.player1.playerId == this.player1.id) {
      this.player1.y = data.player1.paddleY;
      this.player1.paddleSpeed = data.player1.paddleSpeed;
    } else {
      this.player2.y = data.player1.paddleY;
      this.player2.paddleSpeed = data.player1.paddleSpeed;
    }
  }

  update() {
    this.ball.move();

    if (
      this.ball.y - this.ball.radius <= 0 ||
      this.ball.y + this.ball.radius >= this.screenHeight
    ) {
      this.ball.speedY *= -1;
    }

    if (this.typeOfGame === "localPvAi" && this.player2 instanceof AIPlayer) {
      this.player2.updateAI(this.player1.score, this.player2.score);
    }

    //left player collision
    if (
      this.ball.speedX < 0 && // Ball moving left
      this.ball.prevX - this.ball.radius >
        this.player1.x + this.player1.paddleWidth && // Was to the right of paddle
      this.ball.x - this.ball.radius <=
        this.player1.x + this.player1.paddleWidth && // Now overlapping or past paddle
      this.ball.y + this.ball.radius >=
        this.player1.y - this.player1.paddleHeight / 2 &&
      this.ball.y - this.ball.radius <=
        this.player1.y + this.player1.paddleHeight / 2
    ) {
      this.ball.speedX = Math.abs(this.ball.speedX); // Ensure ball bounces right
      this.ball.x =
        this.player1.x + this.player1.paddleWidth + this.ball.radius + 1; // Reposition ball to prevent sticking
    }

    //right player collision
    if (
      this.ball.speedX > 0 && // Ball moving right
      this.ball.prevX + this.ball.radius < this.player2.x && // Was to the left of paddle
      this.ball.x + this.ball.radius >= this.player2.x && // Now overlapping or past paddle
      this.ball.y + this.ball.radius >=
        this.player2.y - this.player2.paddleHeight / 2 &&
      this.ball.y - this.ball.radius <=
        this.player2.y + this.player2.paddleHeight / 2
    ) {
      this.ball.speedX = -Math.abs(this.ball.speedX); // Ensure ball bounces left
      this.ball.x =
        this.player2.x - this.player2.paddleWidth - this.ball.radius - 1; // Reposition ball to prevent sticking
    }

    // Score detection - only trigger if ball completely passes the paddle area
    if (this.ball.x + this.ball.radius < 0) {
      this.player2.score += 1;
      console.log(
        `Player 1 score: ${this.player1.score}, Player 2 score: ${this.player2.score}`
      );
      this.ball.reset();
    }

    if (this.ball.x - this.ball.radius > this.screenWidth) {
      this.player1.score += 1;
      console.log(
        `Player 1 score: ${this.player1.score}, Player 2 score: ${this.player2.score}`
      );
      this.ball.reset();
    }

    if (
      this.player1.score >= gameSettings.maxScore ||
      this.player2.score >= gameSettings.maxScore
    )
      this.stopGame("normalMaxScoreReached");
  }

  resetGame() {
    this.isGameOver = false;
    this.ball.reset();
    this.player1.resetScore();
    this.player2.resetScore();
    this.player1.resetPos();
    this.player2.resetPos();
  }
}
