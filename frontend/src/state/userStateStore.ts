import { exampleImage } from "../testing/exampleImage";
import { deepCopyObj } from "../utils/utils";
import { StoreCallback } from "./types";
import { UserState } from "./userStateTypes";

class UserStateStore {
  listeners: Set<StoreCallback>;
  state: UserState;
  constructor() {
    this.state = this.init();
    this.listeners = new Set<StoreCallback>();
  }

  init() {
    const test_user_id = `userid_${sessionStorage.getItem("transTestId")}`;
    this.state = {
      image: exampleImage,
      displayName: "TEST_USER",
      friends: ["friend_1_id", "friend_2_id"],
      id: test_user_id,
      email: "test@user.de",
      matchHistory: [
        {
          date: "15.02.2025",
          player1Id: "TEST_USER",
          player2Id: "friend_1_id",
          result: {
            player1: 1,
            player2: 7,
          },
          tournament: null,
        },
      ],
      online: true,
    };
    return this.state;
  }

  subscribe(callback: StoreCallback): () => void {
    this.listeners.add(callback);
    return () => {
      this.listeners.delete(callback);
    };
  }

  get(): UserState {
    return this.state;
  }

  updateUserSettings(
    updatedState: Partial<Pick<UserState, "image" | "displayName" | "email">>
  ) {
    this.state = deepCopyObj({ ...this.state, ...updatedState });
    this.listeners.forEach((callback) => callback());
  }

  // update(newState: UserState) {
  //   this.state = deepCopyObj(newState);
  //   this.listeners.forEach((callback) => callback());
  // }
}

export { UserStateStore };
