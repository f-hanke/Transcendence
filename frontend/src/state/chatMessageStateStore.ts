import { ChatServiceTypes } from "transcendence";
import { deepCopyObj } from "../utils/utils";
import { ChatMessageState } from "./chatStateTypes";
import { StoreCallback } from "./types";

class ChatMessageStateStore {
  listeners: Set<StoreCallback>;
  state: ChatMessageState;
  constructor() {
    this.state = this.init();
    this.listeners = new Set<StoreCallback>();
  }

  init() {
    this.state = {
      messages: [],
      recipientId: "",
    };

    for (let i = 0; i < 20; i++) {
      if (i % 2 == 0) {
        this.state.messages.push({
          authorId: "USER_ID",
          date: Date.now(),
          message: "TEST MESSAGE COMING FROM USER",
          recipientId: String(i),
        });
      } else {
        this.state.messages.push({
          authorId: String(i),
          date: Date.now(),
          message: "TEST MESSAGE DIRECTED AT USER",
          recipientId: "USER_ID",
        });
      }
    }
    return this.state;
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

  addMessage(recipientId: string, newMessage: ChatServiceTypes.Message) {
    if (this.state.recipientId === recipientId) {
      this.state.messages.push(deepCopyObj(newMessage));
      this.updateListenersOnChange();
    }
  }

  updateListenersOnChange() {
    this.listeners.forEach((callback) => callback());
  }
}

export { ChatMessageStateStore };
