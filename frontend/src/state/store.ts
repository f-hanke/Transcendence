import { GameStateStore } from "./gameStateStore";
import { LanguageStateStore } from "./languageStateStore/languageStateStore";
import { MatchmakingStateStore } from "./matchmakingStateStore";
import { NotificationStateStore } from "./notificationStateStore";
import { OneVOneLocalStateStore } from "./oneVOneLocalStateStore";
import { RegisterStore } from "./registerStateStore";
import { State } from "./types";
import { UserStateStore } from "./userStateStore";

class Store {
  gameStore: GameStateStore;
  notificationStore: NotificationStateStore;
  languageStore: LanguageStateStore;
  matchmakingStore: MatchmakingStateStore;
  userStore: UserStateStore;
  oneVOneLocalStore: OneVOneLocalStateStore;
  registerStore: RegisterStore;
  constructor(initialState: State) {
    this.gameStore = new GameStateStore(initialState.gameState);
    this.notificationStore = new NotificationStateStore(
      initialState.notificationState
    );
    this.languageStore = new LanguageStateStore();
    this.matchmakingStore = new MatchmakingStateStore(initialState.matchmakingState);
    this.userStore = new UserStateStore(initialState.userState);
    this.oneVOneLocalStore = new OneVOneLocalStateStore(initialState.oneVOneLocalState);
    this.registerStore = new RegisterStore(initialState.registerState);
  }

}

export { Store };
