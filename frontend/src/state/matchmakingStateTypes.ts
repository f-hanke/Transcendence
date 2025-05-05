import { MatchMakingTypes } from "transcendence";


type MatchmakingState = {
  ownMatch: MatchMakingTypes.BasicGame | null;
  otherMatches: MatchMakingTypes.BasicGame[];
};

type MatchMakingMatchGroups = {
  ownMatch: MatchMakingTypes.BasicGame | null;
  public: MatchMakingTypes.BasicGame[],
  private: MatchMakingTypes.BasicGame[],
  tournament: MatchMakingTypes.BasicGame[],
}

export type { MatchmakingState, MatchMakingMatchGroups };
