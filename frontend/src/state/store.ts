import { GameStateStore } from "./gameStateStore";
import { LanguageStateStore } from "./languageStateStore/languageStateStore";
import { MatchmakingStateStore } from "./matchmakingStateStore";
import { NotificationStateStore } from "./notificationStateStore";
import { State } from "./types";
import { UserStateStore } from "./userStateStore";

class Store {
  gameStore: GameStateStore;
  notificationStore: NotificationStateStore;
  languageStore: LanguageStateStore;
  matchmakingStore: MatchmakingStateStore;
  userStore: UserStateStore;
  constructor(initialState: State) {
    this.gameStore = new GameStateStore(initialState.gameState);
    this.notificationStore = new NotificationStateStore(
      initialState.notificationState
    );
    this.languageStore = new LanguageStateStore();
    this.matchmakingStore = new MatchmakingStateStore(initialState.matchmakingState);
    this.userStore = new UserStateStore(initialState.userState);
  }

  // 🆕 Async fetch function to update state
  // async fetchState<K extends AllStateKeys>(
  //   key: K,
  //   fetchFunction: () => Promise<State[K]>
  // ): Promise<void> {
  //   try {
  //     const data = await fetchFunction();
  //     this.setState({ [key]: data });
  //   } catch (error) {
  //     console.error(`Failed to fetch ${key}:`, error);
  //   }
  // }
}

export { Store };
