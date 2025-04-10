import { ChatServiceTypes, isDefined } from "transcendence";
import { deepCopyObj } from "../utils/utils";
import { ChatUserGroups, ChatUserState } from "./chatStateTypes";
import { StoreCallback } from "./types";
import { exampleImage } from "../testing/exampleImage";

class ChatUserStateStore {
  listeners: Set<StoreCallback>;
  state: ChatUserState;
  constructor() {
    this.state = this.init();
    this.listeners = new Set<StoreCallback>();
  }

  init() {
    this.state = new Map() as ChatUserState;

    // for (let i = 0; i < 20; i++) {
    //   this.state.set(`user_${i}`, {
    //     blocked: Math.random() < 0.5,
    //     friend: Math.random() < 0.5,
    //     online: Math.random() < 0.5,
    //     unreadMessages: Math.random() < 0.5,
    //     displayName: "DisplayName",
    //     recipientId: String(i),
    //     email: "test@email.com",
    //     image: exampleImage,
    //     lastMessage: "This was the last message!",
    //   });
    // }

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

  getUserGroups(): ChatUserGroups {
    const groups: ChatUserGroups = {
      friends: [],
      online: [],
      offline: [],
      blocked: [],
    };
    this.state.forEach((userObj, userId) => {
      const userCopy = deepCopyObj(userObj);
      if (userObj.blocked) groups.blocked.push(userCopy);
      else if (userObj.friend) groups.friends.push(userCopy);
      else if (userObj.online) groups.online.push(userCopy);
      else if (!userObj.online) groups.offline.push(userCopy);
      else throw new Error("User not assigned to any group!");
    });
    return groups;
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
    this.updateListenersOnChange();
  }

  updateUserListFromArray(userList: ChatServiceTypes.ChatUser[])
  {
    this.state = new Map();
    for (const user of userList)
    {
      this.state.set(user.recipientId, user);
    }
    this.updateListenersOnChange();
  }

  updateListenersOnChange() {
    this.listeners.forEach((callback) => callback());
  }
}

export { ChatUserStateStore };
