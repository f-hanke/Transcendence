import { UserState } from "./userStateTypes";

type AuthorId = string;

type Message = {
  ownMessage: boolean;
  id: string;
  message: string;
};

type ChatState =
{
  messages: Record<AuthorId, Message[]>
  users: UserState[];
}

export type { ChatState, Message, AuthorId };
