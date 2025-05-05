import { deepCopyObj } from "../utils/utils";
import { StoreCallback } from "./types";
import { RegisterState } from "./registerStateTypes";

class RegisterStore {
  listeners: Set<StoreCallback>;
  state: RegisterState;
  constructor() {
    this.state = this.init();
    this.listeners = new Set<StoreCallback>();
  }

  init() {
    this.state = {
      displayName: "",
      email: "",
    };
    return this.state;
  }

  subscribe(callback: StoreCallback): () => void {
    this.listeners.add(callback);
    return () => {
      this.listeners.delete(callback);
    };
  }

  updateOneField(key: keyof RegisterState, val: string) {
    this.state[key] = val;
    this.updateListenersOnChange();
  }

  update(newState: RegisterState) {
    this.state = deepCopyObj(newState);
    this.updateListenersOnChange();
  }

  updateListenersOnChange() {
    this.listeners.forEach((callback) => callback());
  }

  get(): RegisterState {
    return this.state;
  }

  getResetState() {
    return {
      displayName: "",
      email: "",
      password1: "",
      password2: "",
    };
  }

  resetState() {
    this.state = this.getResetState();
    this.updateListenersOnChange();
  }
}

export { RegisterStore };
