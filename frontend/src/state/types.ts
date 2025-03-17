import { GameState } from "./gameStateTypes";
import { MatchmakingState } from "./matchmakingStateTypes";
import { NotificationState } from "./notificationStateTypes";

interface State {
  gameState: GameState;
  notificationState: NotificationState;
  matchmakingState: MatchmakingState;
}

type AllStateKeys = keyof State;

type StoreCallback = () => void;

export type { State, StoreCallback, AllStateKeys };
