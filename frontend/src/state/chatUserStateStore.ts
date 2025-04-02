import { isDefined } from "transcendence";
import { deepCopyObj } from "../utils/utils";
import { ChatUserState } from "./chatStateTypes";
import { StoreCallback } from "./types";

class ChatUserStateStore {
  listeners: Set<StoreCallback>;
  state: ChatUserState;
  constructor(initialState: ChatUserState) {
    this.state = initialState;
    this.listeners = new Set<StoreCallback>();
  }

  subscribe(callback: StoreCallback): () => void {
    this.listeners.add(callback);
    return () => {
      this.listeners.delete(callback);
    };
  }

  get(): ChatUserState {
    return this.state;
  }

  updateChangeUserOnlineStatus(userId: string, online: boolean) {
    const user = this.state.get(userId);
    if (isDefined(user)) {
      user.online = online;
      this.updateListenersOnChange();
    }
  }

  updateChangeUserBlockedStatus(userId: string, blocked: boolean) {
    const user = this.state.get(userId);
    if (isDefined(user)) {
      user.blocked = blocked;
      this.updateListenersOnChange();
    }
  }

  updateChangeUserUnreadMessageStatus(userId: string, unreadMessages: boolean) {
    const user = this.state.get(userId);
    if (isDefined(user)) {
      user.unreadMessages = unreadMessages;
      this.updateListenersOnChange();
    }
  }

  updateChangeUserLastMessage(userId: string, newLastMessage: string) {
    const user = this.state.get(userId);
    if (isDefined(user)) {
      user.lastMessage = newLastMessage;
      this.updateListenersOnChange();
    }
  }

  updateChangeUserLastMessageAndUnreadMessageStatus(
    userId: string,
    newLastMessage: string,
    unreadMessages: boolean = true
  ) {
    const user = this.state.get(userId);
    if (isDefined(user)) {
      user.lastMessage = newLastMessage;
      user.unreadMessages = unreadMessages;
      this.updateListenersOnChange();
    }
  }

  update(newState: ChatUserState) {
    this.state = deepCopyObj(newState);
    this.listeners.forEach((callback) => callback());
  }

  updateListenersOnChange() {
    this.listeners.forEach((callback) => callback());
  }
}

export { ChatUserStateStore };
