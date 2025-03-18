type BasicGame = {
  matchId: string;
  hostId: string;
  oponentId: string | null;
};

type MatchmakingState = {
  ownMatchId: string | null;
  otherMatches: BasicGame[];
};

export type { MatchmakingState, BasicGame };
