type MatchDuringInitiation = {
  matchId: string;
  hostId: string;
  hostNickName: string;
};

type MatchmakingState = {
  ownMatch: MatchDuringInitiation | null;
  otherMatches: MatchDuringInitiation[];
};

export type { MatchmakingState, MatchDuringInitiation };
