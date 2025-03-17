import { GameStateStore } from "./gameStateStore";
import { GameState } from "./gameStateTypes";
import { NotificationStateStore } from "./notificationStateStore";
import { NotificationState } from "./notificationStateTypes";

interface State {
  gameState: GameState;
  notificationState: NotificationState;
}

type StatesStores ={
  gameState: GameStateStore;
  notificationState: NotificationStateStore;
}

type AllStateKeys = keyof State;

type StoreCallback = () => void;

export type { StatesStores, State, StoreCallback, AllStateKeys };
