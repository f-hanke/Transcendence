import {
  GameServiceTypes,
  gameSettings,
  generateUniqueId,
  isDefined,
} from "transcendence";
import { deepCopyObj } from "../utils/utils";
import {
  GameState,
  GameStateStates,
  GameTypeOfGame,
  Paddle,
  UpdateOnSuccessfullMatchmaking,
} from "./gameStateTypes";
import { StoreCallback } from "./types";

class GameStateStore {
  listeners: Set<StoreCallback>;
  state: GameState;
  constructor() {
    this.state = this.init();
    this.listeners = new Set<StoreCallback>();
  }

  init() {
    const paddleRight: Paddle = {
      playerId: "P_Right_PLAYER",
      paddleSpeed: 0,
      paddleY: gameSettings.playerYStart,
      score: 0,
    };
    const paddleLeft: Paddle = {
      playerId: "P_LEFT_PLAYER",
      paddleSpeed: 0,
      paddleY: gameSettings.playerYStart,
      score: 0,
    };
    this.state = {
      oponentId: "",
      hostId: "",
      selfHosted: true,
      matchId: generateUniqueId(),
      typeOfGame: "localPvP",
      state: "none",
      paddleLeft: paddleLeft,
      ownPaddle: paddleLeft,
      paddleRight: paddleRight,
      enemyPaddle: paddleRight,
      playerIdToPaddleMap: new Map(),
      ball: {
        x: gameSettings.ballXStart,
        y: gameSettings.ballYStart,
      },
    };
    return this.state;
  }

  reset() {
    this.init();
  }

  subscribe(callback: StoreCallback): () => void {
    this.listeners.add(callback);
    return () => {
      this.listeners.delete(callback);
    };
  }

  update(newState: GameState) {
    this.state = structuredClone(newState);
    this.updateListenersOnChange();
  }

  updateGameStateState(
    newState: GameStateStates,
    updateListeners: boolean = true
  ) {
    this.state.state = newState;
    if (updateListeners) this.updateListenersOnChange();
  }

  updateMatchMakingSuccessful(data: UpdateOnSuccessfullMatchmaking) {
    this.state.paddleLeft.playerId = data.playerLeftPaddleId;
    this.state.paddleRight.playerId = data.playerRightPaddleId;
    this.state.hostId = data.hostId;
    this.state.oponentId = data.oponentId;
    this.state.selfHosted = data.selfHosted;
    this.state.ownPaddle = data.selfHosted
      ? this.state.paddleLeft
      : this.state.paddleRight;
    this.state.enemyPaddle = data.selfHosted
      ? this.state.paddleRight
      : this.state.paddleLeft;
    this.state.playerIdToPaddleMap.set(
      this.state.paddleLeft.playerId,
      this.state.paddleLeft
    );
    this.state.playerIdToPaddleMap.set(
      this.state.paddleRight.playerId,
      this.state.paddleRight
    );
    if (isDefined(data.matchId)) this.state.matchId = data.matchId;
    if (isDefined(data.typeOfGame)) this.state.typeOfGame = data.typeOfGame;
    this.updateListenersOnChange();
  }

  updateGameStateTypeOfGame(newState: GameTypeOfGame) {
    this.state.typeOfGame = newState;
    this.updateListenersOnChange();
  }

  updateBallPosition(newState: GameServiceTypes.DataServerUpdateGameState) {
    this.state.ball.x = newState.ball.x;
    this.state.ball.y = newState.ball.y;
    this.updateScore(newState);
    this.updateListenersOnChange();
  }

  updateScore(newState: GameServiceTypes.DataServerUpdateGameState) {
    const paddle1ById = this.getPaddleByPlayerId(newState.player1.id);
    const paddle2ById = this.getPaddleByPlayerId(newState.player2.id);
    paddle1ById.score = newState.player1.score;
    paddle2ById.score = newState.player2.score;
  }

  updateBallPositionNOponentPaddle(
    newState: GameServiceTypes.DataServerUpdateGameState
  ) {
    this.state.ball.x = newState.ball.x;
    this.state.ball.y = newState.ball.y;
    const newOponentPaddle =
      window.store.userStore.get().id === newState.player1.id
        ? newState.player2
        : newState.player1;
    this.getPaddleByPlayerId(newOponentPaddle.id).paddleY =
      newOponentPaddle.paddleY;
    this.getPaddleByPlayerId(newState.player1.id).score = newState.player1.score;
    this.getPaddleByPlayerId(newState.player2.id).score = newState.player2.score;
    this.updateListenersOnChange();
  }

  updateListenersOnChange() {
    this.listeners.forEach((callback) => callback());
  }

  updateMatchId(matchId: string) {
    this.state.matchId = matchId;
    this.updateListenersOnChange();
  }

  get(): GameState {
    return this.state;
  }

  getPaddleByPlayerId(playerId: string) {
    return this.state.playerIdToPaddleMap.get(playerId) as Paddle;
  }
}

export { GameStateStore };
