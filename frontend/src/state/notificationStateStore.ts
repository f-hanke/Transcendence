import { deepCopyObj } from "../utils/utils";
import { Notification, NotificationState } from "./notificationStateTypes";
import { StoreCallback } from "./types";

class NotificationStateStore {
  listeners: Set<StoreCallback>;
  state: NotificationState;
  constructor(initialState: NotificationState) {
    this.state = initialState;
    this.listeners = new Set<StoreCallback>();
  }

  subscribe(callback: StoreCallback): () => void {
    this.listeners.add(callback);
    return () => {
      this.listeners.delete(callback);
    };
  }

  update(newState: NotificationState) {
    this.state = deepCopyObj(newState);
    this.listeners.forEach((callback) => callback());
  }

  updateAddNotification(notification: Notification)
  {
    this.state.push(deepCopyObj(notification));
    this.listeners.forEach((callback) => callback());
  }

  get(): NotificationState {
    return this.state;
  }
}

export { NotificationStateStore };
