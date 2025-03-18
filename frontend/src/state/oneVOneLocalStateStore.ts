import { deepCopyObj, generateUniqueId } from "../utils/utils";
import {
  MatchDuringInitiation,
  MatchmakingState,
} from "./matchmakingStateTypes";
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

  updatePlayer2Name(newPlayer2Name: string)
  {
    this.state.player2Name = newPlayer2Name;
    this.listeners.forEach((callback) => callback());
  }

  // update(newState: OneVOneLocalState) {
  //   if ([null, undefined, ""].includes(newState.player2Name)) {
  //     this.state.player2Name = null;
  //   } else {
  //     this.state = deepCopyObj(newState);
  //   }
  //   this.listeners.forEach((callback) => callback());
  // }

  get(): OneVOneLocalState {
    return this.state;
  }
}

export { OneVOneLocalStateStore };
