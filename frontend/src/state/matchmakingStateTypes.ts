import { MatchMakingTypes } from "transcendence";


type MatchmakingState = {
  ownMatch: MatchMakingTypes.BasicGame | null;
  otherMatches: MatchMakingTypes.BasicGame[];
  tournaments: MatchMakingTypes.Tournament[];
};

type MatchMakingMatchGroups = {
  ownMatch: MatchMakingTypes.BasicGame | null;
  public: MatchMakingTypes.BasicGame[],
  private: MatchMakingTypes.BasicGame[],
  tournament: MatchMakingTypes.BasicGame[],
}

type TournamentGroups = {
  tournamentsPlayerAlreadyJoined: MatchMakingTypes.Tournament[];
  tournamentsToJoin: MatchMakingTypes.Tournament[];
  tournamentsThatAreFull: MatchMakingTypes.Tournament[];
  playerIsPartOfATournament: boolean;
}

export type { MatchmakingState, MatchMakingMatchGroups, TournamentGroups };
