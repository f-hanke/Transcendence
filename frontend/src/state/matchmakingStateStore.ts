import { isDefined, jlog, MatchMakingTypes } from "transcendence";
import { deepCopyObj } from "../utils/utils";
import { MatchmakingState } from "./matchmakingStateTypes";
import { StoreCallback } from "./types";

class MatchmakingStateStore {
  listeners: Set<StoreCallback>;
  state: MatchmakingState;
  constructor() {
    this.state = this.init();
    this.listeners = new Set<StoreCallback>();
  }

  init() {
    this.state = {
      ownMatch: null,
      otherMatches: [],
    };
    return this.state;
  }

  updateListenersOnChange() {
    this.listeners.forEach((callback) => callback());
  }

  subscribe(callback: StoreCallback): () => void {
    this.listeners.add(callback);
    return () => {
      this.listeners.delete(callback);
    };
  }

  // addMatch(newMatch: MatchMakingTypes.BasicGame) {
  //   if (
  //     this.state.otherMatches.filter(
  //       (elem) => elem.matchId === newMatch.matchId
  //     ).length == 0
  //   ) {
  //     this.state.otherMatches.push(deepCopyObj(newMatch));
  //   }
  //   this.updateListenersOnChange();
  // }

  createGame(match: MatchMakingTypes.BasicGame) {
    if (match.hostId === window.store.userStore.get().id)
      this.state.ownMatch = deepCopyObj(match);
    else this.state.otherMatches.push(deepCopyObj(match));
    this.updateListenersOnChange();
  }

  deleteGame(match: MatchMakingTypes.BasicGame) {
    if (
      isDefined(this.state.ownMatch) &&
      this.state.ownMatch.matchId === match.matchId
    )
      this.state.ownMatch = null;
    else
      this.state.otherMatches = this.state.otherMatches.filter(
        (elem) => elem.matchId !== match.matchId
      );
    this.updateListenersOnChange();
  }

  updateFromAllMatches(allMatches: MatchMakingTypes.BasicGame[]) {
    console.log("UPDATE FROM ALL MATCHES");
    jlog(allMatches);
    const newState: MatchmakingState = {
      otherMatches: [],
      ownMatch: null,
    };
    const clientId = window.store.userStore.get().id;
    allMatches.forEach((match) => {
      if (match.hostId === clientId) newState.ownMatch = match;
      else newState.otherMatches.push(match);
    });
    this.state = deepCopyObj(newState);
    this.updateListenersOnChange();
  }

  updateOneGame(updateMatch: MatchMakingTypes.BasicGame) {
    const game = this.state.otherMatches.find(
      (match) => match.matchId === updateMatch.matchId
    );
    if (isDefined(game)) game.oponentId = updateMatch.oponentId;
    else this.state.otherMatches.push(deepCopyObj(updateMatch));
    this.updateListenersOnChange();
  }

  update(newState: MatchmakingState) {
    this.state = deepCopyObj(newState);
    this.updateListenersOnChange();
  }

  get(): MatchmakingState {
    return this.state;
  }
}

export { MatchmakingStateStore };
