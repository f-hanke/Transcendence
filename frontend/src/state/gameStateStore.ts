import { deepCopyObj } from "../utils/utils";
import { GameState } from "./gameStateTypes";
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
    this.listeners.forEach((callback) => callback());
  }

  updateServerSignaledStart() {
    this.state.state = "startSignaledByServer";
    this.listeners.forEach((callback) => callback());
  }

  get(): GameState {
    return this.state;
  }
}

export { GameStateStore };
