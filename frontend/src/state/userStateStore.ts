import { ChatServiceTypes, GameResultTypes } from "transcendence";
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
        displayName: "",
        friends: [],
        id: test_user_id,
        email: "",
        matchHistory: [],
        tournamentHistory: [],
        online: true,
        password: "",
        fetchNeeded: true,
        otherUserId: null,
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

  updateUsersOnChange(rerender: boolean = true) {
    if (rerender) this.listeners.forEach((callback) => callback());
  }

  get(): UserState {
    return this.state;
  }

  updateUserId(newId: string, rerender: boolean = true) {
    this.state.details.id = newId;
    this.updateUsersOnChange(rerender);
  }

  updateUserSettings(
    updatedState: Partial<Pick<UserState["details"], "displayName" | "email">>,
    rerender: boolean = true
  ) {
    const newState = deepCopyObj(this.state);
    for (const detail of Object.keys(updatedState)) {
      if (["displayName", "email"].includes(detail)) {
        const typedDetail = detail as keyof Pick<
          UserState["details"],
          "displayName" | "email"
        >;
        newState["details"][typedDetail] = updatedState[typedDetail] as string;
      }
    }
    this.state = newState;
    this.updateUsersOnChange(rerender);
  }

  updateUserImage(
    newImage: ChatServiceTypes.BufferLike,
    rerender: boolean = true
  ) {
    this.state.details.image = newImage;
    this.updateUsersOnChange(rerender);
  }

  updateSetEditState(
    updatedState: Partial<UserState["editState"]>,
    rerender: boolean = true
  ) {
    this.state.editState = deepCopyObj({
      ...this.state.editState,
      ...updatedState,
    });
    this.updateUsersOnChange(rerender);
  }

  updateSetFetchNeeded(needed: boolean, rerender: boolean = true) {
    this.state.details.fetchNeeded = needed;
    this.updateUsersOnChange(rerender);
  }

  updateSetOtherUserId(newId: string | null, rerender: boolean = true) {
    this.state.details.otherUserId = newId;
    this.updateUsersOnChange(rerender);
  }

  updateMatchHistory(
    newMatchHistory: GameResultTypes.MatchResult[],
    rerender: boolean = true
  ) {
    this.state.details.matchHistory = deepCopyObj(newMatchHistory);
    this.updateUsersOnChange(rerender);
  }

  updateTournamentHistory(
    newTournamentHistory: GameResultTypes.TournamentResult[],
    rerender: boolean = true
  ) {
    this.state.details.tournamentHistory = deepCopyObj(newTournamentHistory);
    this.updateUsersOnChange(rerender);
  }

  // update(newState: UserState) {
  //   this.state = deepCopyObj(newState);
  //   this.listeners.forEach((callback) => callback());
  // }
}

export { UserStateStore };
