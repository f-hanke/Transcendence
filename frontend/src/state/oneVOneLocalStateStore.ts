import { OneVOneLocalState } from "./oneVOneLocalStateTypes";
import { StoreCallback } from "./types";

class OneVOneLocalStateStore {
  listeners: Set<StoreCallback>;
  state: OneVOneLocalState;
  constructor(initialState: OneVOneLocalState) {
    this.state = initialState;
    this.listeners = new Set<StoreCallback>();
  }

  subscribe(callback: StoreCallback): () => void {
    this.listeners.add(callback);
    return () => {
      this.listeners.delete(callback);
    };
  }

  updatePlayer2Name(newPlayer2Name: string) {
    this.state.player2Name = newPlayer2Name;
    this.listeners.forEach((callback) => callback());
  }

  get(): OneVOneLocalState {
    return this.state;
  }
}

export { OneVOneLocalStateStore };
