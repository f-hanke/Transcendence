import { deepCopyObj, generateUniqueId } from "../utils/utils";
import { MatchDuringInitiation, MatchmakingState } from "./matchmakingStateTypes";
import { StoreCallback } from "./types";

class MatchmakingStateStore {
  listeners: Set<StoreCallback>;
  state: MatchmakingState;
  constructor(initialState: MatchmakingState) {
    this.state = initialState;
    this.listeners = new Set<StoreCallback>();
  }

  subscribe(callback: StoreCallback): () => void {
    this.listeners.add(callback);
    return () => {
      this.listeners.delete(callback);
    };
  }

  addMatch(newMatch: MatchDuringInitiation) {
    if (
      this.state.otherMatches.filter((elem) => elem.matchId === newMatch.matchId)
        .length == 0
    ) {
      this.state.otherMatches.push(deepCopyObj(newMatch));
    }
    this.listeners.forEach((callback) => callback());
  }

  removeMatch(matchId: string) {
    this.state.otherMatches = this.state.otherMatches.filter(
      (elem) => elem.matchId === matchId
    );
    this.listeners.forEach((callback) => callback());
  }

  openOwnMatch() {
    if (this.state.ownMatchId === null) {
      console.log("openeed own match!");
      this.state.ownMatchId = generateUniqueId();
      this.listeners.forEach((callback) => callback());
    }
  }

  closeOwnMatch() {
    if (this.state.ownMatchId) {
      this.state.ownMatchId = null;
      this.listeners.forEach((callback) => callback());
    }
  }

  update(newState: MatchmakingState) {
    this.state = deepCopyObj(newState);
    this.listeners.forEach((callback) => callback());
  }

  get(): MatchmakingState {
    return this.state;
  }
}

export { MatchmakingStateStore };
