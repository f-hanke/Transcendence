declare namespace MatchMakingTypes {
  type BasicGame = {
    matchId: string;
    hostId: string;
    oponentId: string | null;
    type: "private" | "public" | "tournament";
    invitedPlayerId: null | string;
    tournamentId: null | string;
    needsServerInitiation?: boolean;
  };

  type BasicGameFull = Omit<BasicGame, "oponentId"> & { oponentId: string };

  type AllMatchMakingMessageTypes =
    | ServerUpdateGames
    | ServerCancelGame
    | ServerUpdateOneGame
    | ServerStartGame
    | ClientCreateGame
    | ClientJoinGame
    | ClientLeaveGame
    | ClientDeleteGame;

  type ServerUpdateOneGame = {
    type: "updateOneGame";
    data: BasicGame;
  };

  type ServerUpdateGames = {
    type: "updateGames";
    data: BasicGame[];
  };

  type ServerCancelGame = {
    type: "cancelGame";
    data: BasicGame;
  };

  type ServerStartGame = {
    type: "startGame";
    data: BasicGameFull;
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

  type ClientDeleteGame = {
    type: "deleteGame";
    data: BasicGame;
  };
}

function isBasicGame(obj: any): obj is MatchMakingTypes.BasicGame {
  return (
    typeof obj === "object" &&
    obj !== null &&
    typeof obj.matchId === "string" &&
    typeof obj.hostId === "string" &&
    (typeof obj.oponentId === "string" || obj.oponentId === null) &&
    ["private", "public", "tournament"].includes(obj.type) &&
    (typeof obj.invitedPlayerId === "string" || obj.invitedPlayerId === null) &&
    (typeof obj.tournamentId === "string" || obj.tournamentId === null)
  );
}

function isBasicGameFull(
  value: unknown
): value is MatchMakingTypes.BasicGameFull {
  return isBasicGame(value) && typeof (value as any).oponentId === "string";
}

function isServerUpdateOneGame(
  value: unknown
): value is MatchMakingTypes.ServerUpdateOneGame {
  return (
    typeof value === "object" &&
    value !== null &&
    (value as any).type === "updateOneGame" &&
    isBasicGame((value as any).data)
  );
}

function isServerUpdateGames(
  value: unknown
): value is MatchMakingTypes.ServerUpdateGames {
  return (
    typeof value === "object" &&
    value !== null &&
    (value as any).type === "updateGames" &&
    Array.isArray((value as any).data) &&
    (value as any).data.every(isBasicGame)
  );
}

function isServerCancelGame(
  value: unknown
): value is MatchMakingTypes.ServerCancelGame {
  return (
    typeof value === "object" &&
    value !== null &&
    (value as any).type === "cancelGame" &&
    isBasicGame((value as any).data)
  );
}

function isServerStartGame(
  value: unknown
): value is MatchMakingTypes.ServerStartGame {
  return (
    typeof value === "object" &&
    value !== null &&
    (value as any).type === "startGame" &&
    isBasicGameFull((value as any).data)
  );
}

function isClientLeaveGame(
  value: unknown
): value is MatchMakingTypes.ClientLeaveGame {
  return (
    typeof value === "object" &&
    value !== null &&
    (value as any).type === "leaveGame" &&
    isBasicGame((value as any).data)
  );
}

function isClientDeleteGame(
  value: unknown
): value is MatchMakingTypes.ClientDeleteGame {
  return (
    typeof value === "object" &&
    value !== null &&
    (value as any).type === "deleteGame" &&
    isBasicGame((value as any).data)
  );
}

function isClientCreateGame(
  value: unknown
): value is MatchMakingTypes.ClientCreateGame {
  return (
    typeof value === "object" &&
    value !== null &&
    (value as any).type === "createGame" &&
    isBasicGame((value as any).data)
  );
}

function isClientJoinGame(
  value: unknown
): value is MatchMakingTypes.ClientJoinGame {
  return (
    typeof value === "object" &&
    value !== null &&
    (value as any).type === "joinGame" &&
    isBasicGame((value as any).data)
  );
}

const matchmakingTypeGuards = {
  isBasicGame,
  isBasicGameFull,
  isServerUpdateOneGame,
  isServerUpdateGames,
  isServerCancelGame,
  isClientLeaveGame,
  isClientCreateGame,
  isClientJoinGame,
  isClientDeleteGame,
  isServerStartGame,
} as const;

export { MatchMakingTypes, matchmakingTypeGuards };
