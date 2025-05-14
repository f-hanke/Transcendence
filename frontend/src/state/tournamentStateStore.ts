import { deepCopyObj, deepEqual } from "../utils/utils";
import { StoreCallback } from "./types";
import { TournamentState } from "./tournamentStateTypes";

class TournamentStateStore {
  listeners: Set<StoreCallback>;
  state: TournamentState;
  constructor() {
    this.state = this.init();
    this.listeners = new Set<StoreCallback>();
  }

  init() {
    this.state = null;
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

  updateCurrent(newState: TournamentState) {
    if (!deepEqual(newState, this.state)) {
      this.state = deepCopyObj(newState as NonNullable<TournamentState>);
      this.updateListenersOnChange();
    }
  }

  async updateCurrentFromServer() {
    // to do Milos API
    // dont do this here!
    // const newState = await MatchMakingInterface.getCurrentTournament();
    // this.updateCurrent(newState);
  }

  get(): TournamentState {
    return this.state;
  }
}

export { TournamentStateStore };
