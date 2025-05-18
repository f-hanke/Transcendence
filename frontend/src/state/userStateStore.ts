import { ChatServiceTypes } from "transcendence";
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
    const test_user_id = `${sessionStorage.getItem("transTestId")}`;
    this.state = {
      details: {
        image: null,
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
        password: "",
        fetchNeeded: true,
      },
      editState: {},
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
    updatedState: Partial<
      Pick<UserState["details"], "displayName" | "email" | "id">
    >
  ) {
    const newState = deepCopyObj(this.state);
    for (const detail of Object.keys(updatedState)) {
      const typedDetail = detail as keyof Pick<
        UserState["details"],
        "displayName" | "email" | "id"
      >;
      newState["details"][typedDetail] = updatedState[typedDetail] as string;
    }
    this.state = newState;
    this.listeners.forEach((callback) => callback());
  }

  updateUserImage(newImage: ChatServiceTypes.BufferLike) {
    this.state.details.image = newImage;
    this.listeners.forEach((callback) => callback());
  }

  updateSetEditState(updatedState: Partial<UserState["editState"]>) {
    this.state.editState = deepCopyObj({
      ...this.state.editState,
      ...updatedState,
    });
    this.listeners.forEach((callback) => callback());
  }

  updateSetFetchNeeded(needed: boolean) {
    this.state.details.fetchNeeded = needed;
    this.listeners.forEach((callback) => callback());
  }

  // update(newState: UserState) {
  //   this.state = deepCopyObj(newState);
  //   this.listeners.forEach((callback) => callback());
  // }
}

export { UserStateStore };
