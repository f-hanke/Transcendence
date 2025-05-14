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
  image: string;
  matchHistory: MatchFinished[];
  friends: UserId[];
  online: boolean;
  email: string;
  password: string;
};

type EditableFields = Pick<UserDetails, "displayName" | "email" | "password">

type UserEditState = Partial<EditableFields> & {
  imageFile?: File;
  imagePreviewUrl?: string;
};

type UserState = {
  details: UserDetails,
  editState: UserEditState,
}

export type { UserState, MatchFinished, UserEditState, UserDetails, EditableFields };
