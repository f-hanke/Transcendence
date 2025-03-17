type MsgFromServer =
  | "serverGameEnded"
  | "serverPointScored"
  | "serverGameStateUpdate";
type MsgFromClient = "clientServe" | "clientGameStateUpdate";

interface MsgBluePrint {
  type: MsgFromServer | MsgFromClient;
  data: Partial<GameState>;
}

interface MsgServerGameEnded extends MsgBluePrint {
  type: "serverGameEnded";
  data: {
    player1: Extract<Player, "id" | "score">;
    player2: Extract<Player, "id" | "score">;
  };
}

interface MsgServerPointScored extends MsgBluePrint {
  type: "serverPointScored";
  data: GameState;
}

interface MsgClientServe extends MsgBluePrint {
  type: "clientServe";
  data: {
    ball: Ball;
    player1: Extract<Player, "id" | "paddleY" | "paddleSpeed">;
    player2: Extract<Player, "id" | "paddleY" | "paddleSpeed">;
  };
}

interface MsgServerGameStateUpdate extends MsgBluePrint {
  type: "serverGameStateUpdate";
  ball: Extract<GameState, "ball">;
}

interface MsgClientGameStateUpdate extends MsgBluePrint {
  type: "clientGameStateUpdate";
  ball: {
    player1: Player;
    player2: Player | null;
  };
}

type GameState = {
  gameId: string;
  ball: Ball;
  player1: Player;
  player2: Player;
  maxScore: number;
  pitchWidth: number;
  pitchHeight: number;
  gameEnded: boolean;
};

type Ball = {
  x: number;
  y: number;
  speed: number;
  radius: number;
  dirX: number;
  dirY: number;
};

type Player = {
  id: string;
  paddleY: number;
  paddleSpeed: -1 | 1 | 0;
  paddleWidth: number;
  paddleHeight: number;
  score: number;
};
