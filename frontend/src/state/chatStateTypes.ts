import { ChatServiceTypes } from "transcendence";

type ChatMessageState = {
    recipientId: string;
    messages: ChatServiceTypes.Message[];
  };

type ChatUserState = Map<string, ChatServiceTypes.ChatUser>;

export type { ChatUserState, ChatMessageState };
