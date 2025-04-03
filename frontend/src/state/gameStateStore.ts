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
  UpdateOnSuccessfullMatchmaking,
} from "./gameStateTypes";
import { StoreCallback } from "./types";
import { GameServiceInterface } from "../backendInterface/gameServiceInterface";

class GameStateStore {
  listeners: Set<StoreCallback>;
  state: GameState;
  constructor() {
    this.state = this.init();
    this.listeners = new Set<StoreCallback>();
  }

  init() {
    this.state = {
      oponentId: "",
      hostId: "",
      selfHosted: true,
      matchId: generateUniqueId(),
      typeOfGame: "localPvP",
      state: "none",
      paddleLeft: {
        playerId: "P_LEFT_PLAYER",
        paddleSpeed: 0,
        paddleY: gameSettings.playerYStart,
        score: 0,
      },
      paddleRight: {
        playerId: "P_Right_PLAYER",
        paddleSpeed: 0,
        paddleY: gameSettings.playerYStart,
        score: 0,
      },
      ball: {
        x: gameSettings.ballXStart,
        y: gameSettings.ballYStart,
      },
    };
    return this.state;
  }

  reset(){
    this.init();
  }

  subscribe(callback: StoreCallback): () => void {
    this.listeners.add(callback);
    return () => {
      this.listeners.delete(callback);
    };
  }

  update(newState: GameState) {
    this.state = deepCopyObj(newState);
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
    if (isDefined(data.matchId)) this.state.matchId = data.matchId;
    if (isDefined(data.typeOfGame)) this.state.typeOfGame = data.typeOfGame;
    this.updateListenersOnChange();
  }

  updateGameStateTypeOfGame(newState: GameTypeOfGame) {
    this.state.typeOfGame = newState;
    this.updateListenersOnChange();
  }

  updateBallPosition(newBall: GameServiceTypes.Ball) {
    this.state.ball.x = newBall.x;
    this.state.ball.y = newBall.y;
    this.updateListenersOnChange();
  }

  updateBallPositionNOponentPaddle(
    newState: GameServiceTypes.DataServerUpdateGameState
  ) {
    const ownId = window.store.userStore.get().id;
    this.state.ball.x = newState.ball.x;
    this.state.ball.y = newState.ball.y;
    const oponentPaddle =
      ownId === this.state.paddleLeft.playerId
        ? this.state.paddleRight
        : this.state.paddleLeft;
    const newOponentPaddle =
      ownId === newState.player1.id ? newState.player2 : newState.player1;
    oponentPaddle.paddleY = newOponentPaddle.paddleY;
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
}

export { GameStateStore };
