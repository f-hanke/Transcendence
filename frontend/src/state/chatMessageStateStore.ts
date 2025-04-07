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

    for (let i = 0; i < 10; i++) {
      if (i < 5) {
        this.state.messages.push({
          authorId: "USER_ID",
          date: "25.12.2025",
          message: "TEST MESSAGE COMING FROM USER",
          recipientId: String(i),
        });
      } else {
        this.state.messages.push({
          authorId: String(i),
          date: "25.12.2025",
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

  addMessage(newMessage: ChatServiceTypes.Message) {
    this.state.messages.push(newMessage);
    this.updateListenersOnChange();
  }

  updateListenersOnChange() {
    this.listeners.forEach((callback) => callback());
  }
}

export { ChatMessageStateStore };
