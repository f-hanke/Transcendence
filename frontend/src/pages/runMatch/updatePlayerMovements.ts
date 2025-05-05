import { GameState, Paddle } from "../../state/gameStateTypes";
import { gameSettings } from "transcendence";
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
    const gameStateNew = structuredClone(gameStateCurrent);

    const leftPaddleHasMoved = this.updatePaddleMovementsOnePaddle(
      ["ArrowUp"],
      ["ArrowDown"],
      gameStateNew[paddleLeftOrRight],
      gameStateCurrent[paddleLeftOrRight]
    );

    if (leftPaddleHasMoved) {
      this.updateGameStateClient(gameStateNew);
      this.updateGameStateServerRemote(gameStateNew);
    }


    this.pongTableComponent.animationFrameId = requestAnimationFrame(() =>
      this.updatePlayerMovementsRemote(paddleLeftOrRight)
    );
  }

  updatePlayerMovementsLocalPvAi() {
    const gameStateCurrent = window.store.gameStore.get();
    const gameStateNew = structuredClone(gameStateCurrent);

    const leftPaddleHasMoved = this.updatePaddleMovementsOnePaddle(
      ["ArrowUp"],
      ["ArrowDown"],
      gameStateNew["paddleLeft"],
      gameStateCurrent["paddleLeft"]
    );

    if (leftPaddleHasMoved) {
      this.updateGameStateClient(gameStateNew);
      this.updateGameStateServerLocalPvAi(gameStateNew);
    }

    this.pongTableComponent.animationFrameId = requestAnimationFrame(() =>
      this.updatePlayerMovementsLocalPvAi()
    );
  }

  updatePlayerMovementsLocalPvP() {
    const gameStateCurrent = window.store.gameStore.get();
    const gameStateNew = structuredClone(gameStateCurrent);

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

    structuredClone

    if (leftPaddleHasMoved || rightPaddleHasMoved) {
      this.updateGameStateClient(gameStateNew);
      this.updateGameStateServerLocalPvP(gameStateNew);
    }

    // this.pongTableComponent.render();

    this.pongTableComponent.animationFrameId = requestAnimationFrame(() =>
      this.updatePlayerMovementsLocalPvP()
    );
  }

  updateGameStateClient(newGameState: GameState) {
    window.store.gameStore.update(newGameState);
  }

  updateGameStateServerLocalPvP(newGameState: GameState) {
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

  updateGameStateServerLocalPvAi(newGameState: GameState) {
    GameServiceInterface.sendMessageToServer({
      type: "clientUpdatePaddlePosition",
      data: {
        matchId: newGameState.matchId,
        player1: {
          playerId: newGameState.paddleLeft.playerId,
          paddleY: newGameState.paddleLeft.paddleY,
          paddleSpeed: newGameState.paddleLeft.paddleSpeed,
        },
        player2: null,
      },
    });
  }

  updateGameStateServerRemote(newGameState: GameState) {
    const myPaddle =
      window.store.userStore.get().id === newGameState.paddleLeft.playerId
        ? newGameState.paddleLeft
        : newGameState.paddleRight;
    GameServiceInterface.sendMessageToServer({
      type: "clientUpdatePaddlePosition",
      data: {
        matchId: newGameState.matchId,
        player1: {
          playerId: myPaddle.playerId,
          paddleY: myPaddle.paddleY,
          paddleSpeed: myPaddle.paddleSpeed,
        },
        player2: null,
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
