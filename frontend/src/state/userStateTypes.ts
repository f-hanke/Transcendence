type UserId = string;

type MatchFinished = {
  player1Id: UserId;
  player2Id: UserId;
  result: {
    player1: number;
    player2: number;
  };
  date: string;
  tournament: string | null;
};

type UserState = {
  id: UserId;
  displayName: string;
  image: string;
  matchHistory: MatchFinished[];
  friends: UserId[];
  online: boolean;
  email: string;
};

export type { UserState, MatchFinished };
