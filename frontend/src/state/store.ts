import { ChatMessageStateStore } from "./chatMessageStateStore";
import { ChatUserStateStore } from "./chatUserStateStore";
import { GameStateStore } from "./gameStateStore";
import { LanguageStateStore } from "./languageStateStore/languageStateStore";
import { MatchmakingStateStore } from "./matchmakingStateStore";
import { ModalStateStore } from "./modalStateStore";
import { NotificationStateStore } from "./notificationStateStore";
import { OneVOneLocalStateStore } from "./oneVOneLocalStateStore";
import { PlayerNamesStateStore } from "./playerNamesStateStore";
import { RegisterStore } from "./registerStateStore";
import { TournamentStateStore } from "./tournamentStateStore";
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
  currentTournamentStore: TournamentStateStore;
  playerNamesStore: PlayerNamesStateStore;
  modalStore: ModalStateStore;
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
    this.currentTournamentStore = new TournamentStateStore();
    this.playerNamesStore = new PlayerNamesStateStore();
    this.modalStore = new ModalStateStore();
  }

  reset()
  {
    this.userStore.init();
    this.gameStore.init();
    this.notificationStore.init();
    this.matchmakingStore.init();
    this.oneVOneLocalStore.init();
    this.registerStore.init();
    this.chatMessageStore.init();
    this.chatUserStore.init();
    this.currentTournamentStore.init();
    this.playerNamesStore.init();
    this.modalStore.reset();
  }

}

export { Store };
