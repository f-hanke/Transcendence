import { GameState, Paddle } from "../../state/gameStateTypes";
import { gameSettings, jlog } from "transcendence";
import { deepCopyObj } from "../../utils/utils";
import { PongTable } from "./PongTable";
import { GameServiceInterface } from "../../backendInterface/gameServiceInterface";

type PaddleLeftOrRight = Extract<keyof GameState, "paddleLeft" | "paddleRight">;

class PlayerMovementsUpdater {
  gameState: GameState;
  pongTableComponent: PongTable;
  constructor(pongTableComponent: PongTable) {
    this.gameState = window.store.gameStore.get();
    this.pongTableComponent = pongTableComponent;
  }

  updatePlayerMovementsRemote(paddleLeftOrRight: PaddleLeftOrRight) {
    const gameStateCurrent = window.store.gameStore.get();
    const gameStateNew = deepCopyObj(gameStateCurrent);

    const leftPaddleHasMoved = this.updatePaddleMovementsOnePaddle(
      ["ArrowUp"],
      ["ArrowDown"],
      gameStateNew[paddleLeftOrRight],
      gameStateCurrent[paddleLeftOrRight]
    );

    if (leftPaddleHasMoved) {
      this.updateGameStateClient(gameStateNew);
      // this.updateGameStateServer(gameStateNew);
    }

    this.pongTableComponent.animationFrameId = requestAnimationFrame(() =>
      this.updatePlayerMovementsRemote(paddleLeftOrRight)
    );
  }

  updatePlayerMovementsLocalPvAi(paddleLeftOrRight: PaddleLeftOrRight) {
    return this.updatePlayerMovementsRemote(paddleLeftOrRight);
  }

  updatePlayerMovementsLocalPvP() {
    const gameStateCurrent = window.store.gameStore.get();
    const gameStateNew = deepCopyObj(gameStateCurrent);

    const leftPaddleHasMoved = this.updatePaddleMovementsOnePaddle(
      ["w", "W"],
      ["s", "S"],
      gameStateNew.paddleLeft,
      gameStateCurrent.paddleLeft
    );
    const rightPaddleHasMoved = this.updatePaddleMovementsOnePaddle(
      ["ArrowUp"],
      ["ArrowDown"],
      gameStateNew.paddleRight,
      gameStateCurrent.paddleRight
    );
    if (leftPaddleHasMoved || rightPaddleHasMoved) {
      this.updateGameStateClient(gameStateNew);
      this.updateGameStateServer(gameStateNew);
    }
    this.pongTableComponent.animationFrameId = requestAnimationFrame(() =>
      this.updatePlayerMovementsLocalPvP()
    );
  }

  updateGameStateClient(newGameState: GameState) {
    window.store.gameStore.update(newGameState);
  }

  updateGameStateServer(newGameState: GameState) {
    GameServiceInterface.sendMessageToServer({
      type: "clientUpdatePaddlePosition",
      data: {
        matchId: newGameState.matchId,
        player1: {
          playerId: newGameState.paddleLeft.playerId,
          paddleY: newGameState.paddleLeft.paddleY,
          paddleSpeed: newGameState.paddleLeft.paddleSpeed,
        },
        player2: {
          playerId: newGameState.paddleRight.playerId,
          paddleY: newGameState.paddleRight.paddleY,
          paddleSpeed: newGameState.paddleRight.paddleSpeed,
        },
      },
    });
  }

  updatePaddleMovementsOnePaddle(
    upKey: string[],
    downKey: string[],
    gameStateNewPaddle: Paddle,
    gameStateCurrentPaddle: Paddle
  ) {
    this.updatePaddleSpeed(upKey, downKey, gameStateNewPaddle);
    this.movePaddle(gameStateNewPaddle);
    return this.paddleHasMoved(gameStateNewPaddle, gameStateCurrentPaddle);
  }

  movePaddle(gameStateNewPaddle: Paddle) {
    gameStateNewPaddle.paddleY =
      gameStateNewPaddle.paddleY +
      gameStateNewPaddle.paddleSpeed * gameSettings.paddleSpeed;

    if (gameStateNewPaddle.paddleY > gameSettings.paddleMaxY)
      gameStateNewPaddle.paddleY = gameSettings.paddleMaxY;
    if (gameStateNewPaddle.paddleY < gameSettings.paddleMinY)
      gameStateNewPaddle.paddleY = gameSettings.paddleMinY;
  }

  updatePaddleSpeed(
    upKey: string[],
    downKey: string[],
    gameStateNewPaddle: Paddle
  ) {
    const upKeyPressed = upKey.some((key) =>
      this.pongTableComponent.pressedKeys.has(key)
    );
    const downKeyPressed = downKey.some((key) =>
      this.pongTableComponent.pressedKeys.has(key)
    );

    if (!upKeyPressed && !downKeyPressed) {
      gameStateNewPaddle.paddleSpeed = 0;
    } else if (upKeyPressed && downKeyPressed) {
      gameStateNewPaddle.paddleSpeed = 0;
    } else if (upKeyPressed) {
      gameStateNewPaddle.paddleSpeed = -1;
    } else {
      gameStateNewPaddle.paddleSpeed = 1;
    }

    if (
      gameStateNewPaddle.paddleY >= gameSettings.paddleMaxY &&
      gameStateNewPaddle.paddleSpeed === 1
    ) {
      gameStateNewPaddle.paddleSpeed = 0;
    }
    if (
      gameStateNewPaddle.paddleY <= gameSettings.paddleMinY &&
      gameStateNewPaddle.paddleSpeed === -1
    ) {
      gameStateNewPaddle.paddleSpeed = 0;
    }
  }

  paddleHasMoved(gameStateNewPaddle: Paddle, gameStateCurrentPaddle: Paddle) {
    return (
      gameStateNewPaddle.paddleSpeed != gameStateCurrentPaddle.paddleSpeed ||
      gameStateNewPaddle.paddleY != gameStateCurrentPaddle.paddleY
    );
  }
}

export { PlayerMovementsUpdater };
