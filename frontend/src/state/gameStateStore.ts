import { isDefined } from "transcendence";
import { deepCopyObj } from "../utils/utils";
import { GameState, GameStateStates, GameTypeOfGame } from "./gameStateTypes";
import { StoreCallback } from "./types";

class GameStateStore {
  listeners: Set<StoreCallback>;
  state: GameState;
  constructor(initialState: GameState) {
    this.state = initialState;
    this.listeners = new Set<StoreCallback>();
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

  updateGameStateState(newState: GameStateStates) {
    this.state.state = newState;
    this.updateListenersOnChange();
  }

  updateAssignPaddles(
    playerLeftPaddleId: string,
    playerRightPaddleId?: string
  ) {
    this.state.paddleLeft.playerId = playerLeftPaddleId;
    if (isDefined(playerRightPaddleId))
      this.state.paddleRight.playerId = playerRightPaddleId;
    this.updateListenersOnChange();
  }

  updateGameStateTypeOfGame(newState: GameTypeOfGame) {
    this.state.typeOfGame = newState;
    this.updateListenersOnChange();
  }

  updateListenersOnChange() {
    this.listeners.forEach((callback) => callback());
  }

  get(): GameState {
    return this.state;
  }
}

export { GameStateStore };
