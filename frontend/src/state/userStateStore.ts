import { deepCopyObj } from "../utils/utils";
import { StoreCallback } from "./types";
import { UserState } from "./userStateTypes";

class UserStateStore {
  listeners: Set<StoreCallback>;
  state: UserState;
  constructor(initialState: UserState) {
    this.state = initialState;
    this.listeners = new Set<StoreCallback>();
  }

  subscribe(callback: StoreCallback): () => void {
    this.listeners.add(callback);
    return () => {
      this.listeners.delete(callback);
    };
  }

  get(): UserState {
    return this.state;
  }

  updateUserSettings(updatedState: Partial<Pick<UserState, "image" | "displayName" | "email">>)
  {
    this.state = deepCopyObj({...this.state, ...updatedState});
    this.listeners.forEach((callback) => callback());
  }

  // update(newState: UserState) {
  //   this.state = deepCopyObj(newState);
  //   this.listeners.forEach((callback) => callback());
  // }

}

export { UserStateStore };
