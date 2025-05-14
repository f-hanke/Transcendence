import { isDefined } from "transcendence";
import { StoreCallback } from "./types";
import { PlayerNamesState } from "./playerNamesStateTypes";

class PlayerNamesStateStore {
  listeners: Set<StoreCallback>;
  state: PlayerNamesState;
  constructor() {
    this.state = this.init();
    this.listeners = new Set<StoreCallback>();
  }

  init() {
    this.state = {};
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

  updateAddNames(newIdNameMap: string[]) {
    for (const id in Object.keys(newIdNameMap)) {
      this.state[id] = newIdNameMap[id];
      if (!isDefined(newIdNameMap[id]))
        throw new Error(
          `THERE IS NO DISPLAY NAME FOR THE ID ${newIdNameMap[id]}`
        );
    }
    this.updateListenersOnChange();
  }

  getName(playerId: string) {
    return this.state[playerId];
  }

  get(): PlayerNamesState {
    return this.state;
  }
}

export { PlayerNamesStateStore };
