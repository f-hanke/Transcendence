import { ChatMessageStateStore } from "./chatMessageStateStore";
import { ChatUserStateStore } from "./chatUserStateStore";
import { GameStateStore } from "./gameStateStore";
import { LanguageStateStore } from "./languageStateStore/languageStateStore";
import { MatchmakingStateStore } from "./matchmakingStateStore";
import { NotificationStateStore } from "./notificationStateStore";
import { OneVOneLocalStateStore } from "./oneVOneLocalStateStore";
import { RegisterStore } from "./registerStateStore";
import { UserStateStore } from "./userStateStore";

class Store {
  gameStore: GameStateStore;
  notificationStore: NotificationStateStore;
  languageStore: LanguageStateStore;
  matchmakingStore: MatchmakingStateStore;
  userStore: UserStateStore;
  oneVOneLocalStore: OneVOneLocalStateStore;
  registerStore: RegisterStore;
  chatMessageStore: ChatMessageStateStore;
  chatUserStore: ChatUserStateStore;
  constructor() {
    this.userStore = new UserStateStore();
    this.gameStore = new GameStateStore();
    this.notificationStore = new NotificationStateStore();
    this.languageStore = new LanguageStateStore();
    this.matchmakingStore = new MatchmakingStateStore();
    this.oneVOneLocalStore = new OneVOneLocalStateStore();
    this.registerStore = new RegisterStore();
    this.chatMessageStore = new ChatMessageStateStore();
    this.chatUserStore = new ChatUserStateStore();
  }

}

export { Store };
