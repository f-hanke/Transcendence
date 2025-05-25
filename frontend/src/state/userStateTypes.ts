import { ChatServiceTypes, GameResultTypes } from "transcendence";

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

type UserDetails = {
  id: UserId;
  displayName: string;
  image: ChatServiceTypes.BufferLike | null;
  matchHistory: GameResultTypes.MatchResult[];
  tournamentHistory: GameResultTypes.TournamentResult[];
  friends: UserId[];
  online: boolean;
  email: string;
  password: string;
  fetchNeeded: boolean;
  otherUserId: string | null;
};


type EditableFields = Pick<UserDetails, "displayName" | "email" | "password">

type UserEditState = Partial<EditableFields> & {
  image?: ChatServiceTypes.BufferLike | null;
};

type UserState = {
  details: UserDetails,
  editState: UserEditState,
}

export type { UserState, MatchFinished, UserEditState, UserDetails, EditableFields };
