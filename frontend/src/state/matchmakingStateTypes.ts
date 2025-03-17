type Match = {
  matchId: string;
  hostId: string;
  hostNickName: string;
};

type MatchmakingState = {
  ownMatch: Match | null;
  otherMatches: Match[];
};

export type { MatchmakingState, Match };
