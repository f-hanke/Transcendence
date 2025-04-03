import { MakePropsOptional } from "../globalTypes";

type GameStateStates =
  | "none"
  | "matchmakingSuccessful"
  | "waitingForClientReady"
  | "waitingForServerStart"
  | "running"
  | "endedNormally"
  | "endedPlayerLeft"
  | "endedServerError";

type GameTypeOfGame = "localPvP" | "localPvAi" | "remote";

type Paddle = {
  playerId: string;
  paddleY: number;
  paddleSpeed: 0 | 1 | -1;
  score: number;
};

type GameState = {
  matchId: string;
  hostId: string;
  oponentId: string;
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

type UpdateOnSuccessfullMatchmakingHelper = Pick<
  GameState,
  "oponentId" | "hostId" | "selfHosted" | "matchId" | "typeOfGame"
> & {
  playerLeftPaddleId: string;
  playerRightPaddleId: string;
};


type UpdateOnSuccessfullMatchmaking = MakePropsOptional<UpdateOnSuccessfullMatchmakingHelper, "matchId" | "typeOfGame">;


export type {
  GameState,
  GameStateStates,
  Paddle,
  GameTypeOfGame,
  UpdateOnSuccessfullMatchmaking,
};
