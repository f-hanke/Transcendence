import { GameResultTypes } from "./gameResultTypes";

declare namespace MatchMakingTypes {
  type BasicGame = {
    matchId: string; // leave it unrelated to DB id (when tournament)?
    hostId: string;
    oponentId: string | null;
    type: "private" | "public" | "tournament";
    invitedPlayerId: null | string;
    tournamentId: null | string;
    needsServerInitiation?: boolean;
  };

  type Tournament = {
    tournamentId: string | null; // Steffen's id === DB id in this case
    player1Id: string | null;
    player2Id: string | null;
    player3Id: string | null;
    player4Id: string | null;
  };

  type TournamentWithMatches = Tournament & {
    matches: BasicGame[];
    matchResults: GameResultTypes.MatchResult[];
  };

  type PlayerToCreateTournamentLobby = {
    playerId: string;
  };

  type PlayerIdAndTournamentId = {
    playerId: string;
    tournamentId: string;
  };

  type TournamentId = {
    tournamentId: string;
  };

  type PlayerKey = "player1Id" | "player2Id" | "player3Id" | "player4Id";

  type BasicGameFull = Omit<BasicGame, "oponentId"> & { oponentId: string };

  type TournamentFull = Omit<
    TournamentWithMatches,
    "player1Id" | "player2Id" | "player3Id" | "player4Id"
  > & {
    player1Id: string;
    player2Id: string;
    player3Id: string;
    player4Id: string;
  };

  type AllMatchMakingMessageTypes =
    | ServerUpdateGames
    | ServerCancelGame
    | ServerUpdateOneGame
    | ServerUpdateOneTournament
    | ServerStartGame
    | ClientCreateGame
    | ClientJoinGame
    | ClientLeaveGame
    | ClientDeleteGame
    | ClientCreateTournament
    | ClientJoinTournament
    | ClientLeaveTournament
    | ClientDeleteTournament
    | ServerStartTournament;

  type ServerUpdateOneGame = {
    type: "updateOneGame";
    data: BasicGame;
  };

  type ServerUpdateOneTournament = {
    type: "updateOneTournament";
    data: Tournament;
  };

  type ServerUpdateGames = {
    type: "updateGames";
    data: {
      basicGames: BasicGame[];
      tournaments: Tournament[];
    };
  };

  // GET  /matchmaking/usertournament/:userId  - get running tournament user is part of or null if not part of one

  // type UserTournamentQuery = {
  //   tournament: TournamentWithRanking | null;
  // };

  type PlayerStats = { id: string; rank: number; wins: number; losses: number };

  type TournamentWithRanking = TournamentFull & {
    Ranking: PlayerStats[];
  };

  type UserTournamentQuery = {
    tournament: TournamentWithRanking | null;
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

  type ClientCreateTournament = {
    type: "createTournament";
    data: PlayerToCreateTournamentLobby;
  };

  type ClientJoinTournament = {
    type: "joinTournament";
    data: PlayerIdAndTournamentId;
  };

  type ClientLeaveTournament = {
    type: "leaveTournament";
    data: PlayerIdAndTournamentId;
  };

  type ClientDeleteTournament = {
    type: "deleteTournament";
    data: TournamentFull;
  };

  type ServerStartTournament = {
    type: "startTournament";
    data: TournamentFull;
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
    typeof (value as any).data.basicGames === "object" &&
    (value as any).data.basicGames !== null &&
    Array.isArray((value as any).data.basicGames) &&
    typeof (value as any).data.tournaments === "object" &&
    (value as any).data.tournaments !== null &&
    Array.isArray((value as any).data.tournaments)
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

function isTournament(obj: any): obj is MatchMakingTypes.Tournament {
  return (
    typeof obj === "object" &&
    obj !== null &&
    (typeof obj.tournamentId === "string" || obj.tournamentId === null) &&
    (typeof obj.player1Id === "string" || obj.player1Id === null) &&
    (typeof obj.player2Id === "string" || obj.player2Id === null) &&
    (typeof obj.player3Id === "string" || obj.player3Id === null) &&
    (typeof obj.player4Id === "string" || obj.player4Id === null) &&
    typeof obj.matches === "object" &&
    Array.isArray(obj.matches) &&
    typeof obj.matchResults === "object" &&
    Array.isArray(obj.matchResults)
  );
}

function isServerUpdateOneTournament(
  value: any
): value is MatchMakingTypes.ServerUpdateOneTournament {
  return (
    typeof value === "object" &&
    value !== null &&
    (value as any).type === "updateOneTournament" &&
    isTournament((value as any).data)
  );
}

function isPlayerIdAndTournamentId(
  obj: any
): obj is MatchMakingTypes.PlayerIdAndTournamentId {
  return (
    typeof obj === "object" &&
    obj !== null &&
    typeof obj.playerId === "string" &&
    obj.playerId !== null &&
    typeof obj.tournamentId === "string" &&
    obj.tournamentId !== null
  );
}

function isClientCreateTournament(
  value: unknown
): value is MatchMakingTypes.ClientCreateTournament {
  return (
    typeof value === "object" &&
    value !== null &&
    (value as any).type === "createTournament" &&
    typeof (value as any).data.playerId === "string" &&
    (value as any).data.playerId !== null
  );
}

function isClientJoinTournament(
  value: unknown
): value is MatchMakingTypes.ClientJoinTournament {
  return (
    typeof value === "object" &&
    value !== null &&
    (value as any).type === "joinTournament" &&
    isPlayerIdAndTournamentId((value as any).data)
  );
}

function isClientLeaveTournament(
  value: unknown
): value is MatchMakingTypes.ClientLeaveTournament {
  return (
    typeof value === "object" &&
    value !== null &&
    (value as any).type === "leaveTournament" &&
    isPlayerIdAndTournamentId((value as any).data)
  );
}

function isClientDeleteTournament(
  value: unknown
): value is MatchMakingTypes.ClientDeleteTournament {
  return (
    typeof value === "object" &&
    value !== null &&
    (value as any).type === "deleteTournament" &&
    isTournament((value as any).data)
  );
}

function isServerStartTournament(
  value: unknown
): value is MatchMakingTypes.ServerStartTournament {
  return (
    typeof value === "object" &&
    value !== null &&
    (value as any).type === "startTournament" &&
    isTournament((value as any).data)
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
  isClientCreateTournament,
  isClientJoinTournament,
  isClientLeaveTournament,
  isClientDeleteTournament,
  isServerStartTournament,
  isServerUpdateOneTournament,
} as const;

export { MatchMakingTypes, matchmakingTypeGuards };
