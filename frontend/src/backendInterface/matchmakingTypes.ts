import { BasicGame } from "../state/matchmakingStateTypes";

type ServerUpdateGames = {
  type: "updateGames";
  data: BasicGame[];
};

type ServerCancelGame = {
  type: "cancelGame";
  data: {
    matchId: string;
  };
};

type ClientConnect = {
  type: "connect";
  data: {
    hostId: string;
  };
};

type ClientCreateGame = {
  type: "createGame";
  data: BasicGame;
};

type ClientJoinGame = {
  type: "joinGame";
  data: BasicGame;
};

type ClientLeaveGame = {
  type: "leaveGame";
  data: BasicGame;
};

export type {
  ServerUpdateGames,
  ServerCancelGame,
  ClientConnect,
  ClientCreateGame,
  ClientJoinGame,
  ClientLeaveGame,
};
