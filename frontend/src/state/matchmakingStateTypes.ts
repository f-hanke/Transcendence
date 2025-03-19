import type {BasicGame} from "../../../sharedTypes/matchmakingTypes"


type MatchmakingState = {
  ownMatchId: string | null;
  otherMatches: BasicGame[];
};

export type { MatchmakingState };
