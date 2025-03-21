import { MatchMakingTypes } from "transcendence";


type MatchmakingState = {
  ownMatch: MatchMakingTypes.BasicGame | null;
  otherMatches: MatchMakingTypes.BasicGame[];
};

export type { MatchmakingState };
