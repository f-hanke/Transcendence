import { deepCopyObj } from "../utils/utils";
import { StoreCallback } from "./types";
import { KeyDownCallback, ModalListenerState } from "./modalStateTypes";
import { AllKeyboardKeyCodes } from "../utils/keycodesTypes";

class ModalStateStore {
  listeners: Set<StoreCallback>;
  state: ModalListenerState;
  constructor() {
    this.state = this.reset();
    this.listeners = new Set<StoreCallback>();
  }

  reset() {
    this.state = {
      open: false,
      keyDownCallback: {},
      content: [],
    };
    return this.state;
  }

  subscribe(callback: StoreCallback): () => void {
    this.listeners.add(callback);
    return () => {
      this.listeners.delete(callback);
    };
  }


updateListenersOnChange() {
    this.listeners.forEach((callback) => callback());
  }

  get(): ModalListenerState {
    return this.state;
  }

  updateSetOpen()
  {
    console.log("Opening Modal");
    this.state.open = true;
    this.updateListenersOnChange();
  }

  updateSetClosed()
  {
    console.log("Closing Modal");
    this.state.open = false;
    this.updateListenersOnChange();
  }

  updateAddKeyDownCallback(key: AllKeyboardKeyCodes, cb: KeyDownCallback)
  {
    this.state.keyDownCallback[key] = cb;
    this.updateListenersOnChange();
  }

  updateSetContent(newContent: string[])
  {
    console.log("Updating Modal Content");
    console.log(newContent);
    this.state.content = deepCopyObj(newContent);
    this.updateListenersOnChange();
  }

}

export { ModalStateStore };
