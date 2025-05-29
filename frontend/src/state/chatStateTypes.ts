import { ChatServiceTypes } from "transcendence";

type ChatMessageState = {
    recipientId: string;
    messages: ChatServiceTypes.Message[];
  };

type ChatUserState = Map<string, ChatServiceTypes.ChatUser>;

type ChatUserGroups = {
  notifierBots: ChatServiceTypes.ChatUser[], 
  friends: ChatServiceTypes.ChatUser[],
  online: ChatServiceTypes.ChatUser[],
  offline: ChatServiceTypes.ChatUser[],
  blocked: ChatServiceTypes.ChatUser[],
  pendingClientInvite: ChatServiceTypes.ChatUser[],
  pendingRecipientInvite: ChatServiceTypes.ChatUser[],
}

export type { ChatUserState, ChatMessageState,ChatUserGroups };
