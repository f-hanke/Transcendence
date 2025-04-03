type GameStateStates =
  | "none"
  | "matchmakingSuccessful"
  | "waitingForClientReady"
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
  score: number;
};

type GameState = {
  matchId: string;
  state: GameStateStates;
  typeOfGame: GameTypeOfGame;
  selfHosted: boolean;
  paddleLeft: Paddle;
  paddleRight: Paddle;
  ball: {
    x: number;
    y: number;
  };
};

export type { GameState, GameStateStates, Paddle, GameTypeOfGame };
