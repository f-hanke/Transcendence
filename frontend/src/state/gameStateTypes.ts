type GameStateStates =
  | "none"
  | "waitingForServerStart"
  | "running"
  | "endedNormally"
  | "endedPlayerLeft"
  | "endedServerError"
  ;

type GameTypeOfGame = "localPvP" | "localPvAi" | "remote";


type Paddle =  {
  playerId: string;
  paddleY: number;
  paddleSpeed: 0 | 1 | -1;
};

type GameState = {
  matchId: string;
  state: GameStateStates;
  typeOfGame: GameTypeOfGame;
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
};

export type { GameState, GameStateStates, Paddle, GameTypeOfGame };
