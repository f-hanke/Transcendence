import { isDefined } from "transcendence";
import { StoreCallback } from "./types";
import { PlayerNamesState } from "./playerNamesStateTypes";
import { AuthServiceTypes } from "transcendence";
import { deepCopyObj } from "../utils/utils";
import { transStore } from "../state/store";

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

  update(idNameMap: AuthServiceTypes.UserIdsToNamesMapping) {
    this.state = deepCopyObj(idNameMap);
    this.updateListenersOnChange();
  }

  updateOwnEntry(newOwnDisplayName: string) {
    this.state[transStore.userStore.get().details.id] = newOwnDisplayName;
    this.updateListenersOnChange();
  }

  getName(playerId: string) {
    if (!isDefined(this.state[playerId])) {
      const msg = `DisplayName is not defined for the requested id!`;
      console.log(msg);
      throw new Error(msg);
    }
    return this.state[playerId];
  }

  get(): PlayerNamesState {
    return this.state;
  }
}

export { PlayerNamesStateStore };
