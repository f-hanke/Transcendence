import { GameState } from "./gameStateTypes";
import { MatchmakingState } from "./matchmakingStateTypes";
import { NotificationState } from "./notificationStateTypes";
import { OneVOneLocalState } from "./oneVOneLocalStateTypes";
import { UserState } from "./userStateTypes";

interface State {
  gameState: GameState;
  notificationState: NotificationState;
  matchmakingState: MatchmakingState;
  userState: UserState;
  oneVOneLocalState: OneVOneLocalState;
}

type AllStateKeys = keyof State;

type StoreCallback = () => void;

export type { State, StoreCallback, AllStateKeys };
