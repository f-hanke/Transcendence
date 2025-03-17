interface State {
  gameState: GameState;
  notificationState: NotificationState;
}

type NotificationState = [string, string][];

type GameState = {
  paddleLeft: number;
  paddleRight: number;
  ball: {
    x: number;
    y: number;
    direction: {
      x: number;
      y: number;
    };
  };
  width: number;
  height: number;
};

type StoreCallback = () => void;

export type { State, StoreCallback, GameState, NotificationState };
