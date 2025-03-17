import { deepCopyObj } from "../utils/utils";
import { AuthorId, ChatState, Message } from "./chatStateTypes";
import { StoreCallback } from "./types";

class ChatStateStore {
  listeners: Set<StoreCallback>;
  state: ChatState;
  constructor(initialState: ChatState) {
    this.state = initialState;
    this.listeners = new Set<StoreCallback>();
  }

  subscribe(callback: StoreCallback): () => void {
    this.listeners.add(callback);
    return () => {
      this.listeners.delete(callback);
    };
  }

  get(): ChatState {
    return this.state;
  }

  update(newState: ChatState) {
    this.state = deepCopyObj(newState);
    this.listeners.forEach((callback) => callback());
  }

  addMessage(newMessage: Message, authorId: AuthorId) {
    if (this.state.messages[authorId]) {
      if (
        this.state.messages[authorId].filter((elem) => elem.id === newMessage.id)
          .length === 0
      ) {
        this.state.messages[authorId].push(deepCopyObj(newMessage));
        this.listeners.forEach((callback) => callback());
      }
    } else {
      this.state.messages[authorId] = [deepCopyObj(newMessage)];
      this.listeners.forEach((callback) => callback());
    }
  }
}

export { ChatStateStore };
