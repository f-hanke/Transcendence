type GameStateStates =
  | "none"
  | "waitingForServerStart"
  | "running"
  | "endedNormally"
  | "endedPlayerLeft"
  | "endedServerError"
  ;


type Paddle =  {
  paddleY: number;
  paddleSpeed: 0 | 1 | -1;
};

type GameState = {
  matchId: string;
  state: GameStateStates;
  typeOfGame: "local" | "remote";
  paddleLeft: Paddle;
  paddleRight: Paddle;
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

export type { GameState, GameStateStates, Paddle };
