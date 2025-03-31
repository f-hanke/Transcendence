import { deepCopyObj } from "../utils/utils";
import { ChatMessageState, Message } from "./chatStateTypes";
import { StoreCallback } from "./types";

class ChatMessageStateStore {
  listeners: Set<StoreCallback>;
  state: ChatMessageState;
  constructor(initialState: ChatMessageState) {
    this.state = initialState;
    this.listeners = new Set<StoreCallback>();
  }

  subscribe(callback: StoreCallback): () => void {
    this.listeners.add(callback);
    return () => {
      this.listeners.delete(callback);
    };
  }

  get(): ChatMessageState {
    return this.state;
  }

  update(newState: ChatMessageState) {
    this.state = deepCopyObj(newState);
    this.listeners.forEach((callback) => callback());
  }

  addMessage(newMessage: Message) {
    this.state.messages.push(newMessage);
    this.updateListenersOnChange();
  }

  updateListenersOnChange() {
    this.listeners.forEach((callback) => callback());
  }
}

export { ChatMessageStateStore };
