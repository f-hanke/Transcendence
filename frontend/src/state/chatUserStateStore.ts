import { isDefined } from "transcendence";
import { deepCopyObj } from "../utils/utils";
import { ChatUserState } from "./chatStateTypes";
import { StoreCallback } from "./types";

class ChatUserStateStore {
  listeners: Set<StoreCallback>;
  state: ChatUserState;
  constructor() {
    this.state = this.init();
    this.listeners = new Set<StoreCallback>();
  }

  init(){
    this.state = new Map as ChatUserState;

    for (let i = 0; i < 10; i++) {
      this.state.set(`user_${i}`, {
        blocked: Math.random() < 0.5,
        friend: Math.random() < 0.5,
        online: Math.random() < 0.5,
        unreadMessages: Math.random() < 0.5,
        displayName: "DisplayName",
        recipientId: String(i),
        email: "test@email.com",
        image: "some BASE64 encoded string",
        lastMessage: "This was the last message!",
      });
    }

    return this.state;
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
