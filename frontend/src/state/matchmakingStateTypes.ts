type MatchDuringInitiation = {
  matchId: string;
  hostId: string;
  hostNickName: string;
};

type MatchmakingState = {
  ownMatchId: string | null;
  otherMatches: MatchDuringInitiation[];
};

export type { MatchmakingState, MatchDuringInitiation };
