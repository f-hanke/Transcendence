type Message = {
  ownMessage: boolean;
  id: string;
  message: string;
  date: string;
};

type ChatMessageState = {
  userId: string;
  messages: Message[];
};

type ChatUser = {
  id: string;
  displayName: string;
  image: string;
  online: boolean;
  blocked: boolean;
  email: string;
  lastMessage: string;
  unreadMessages: boolean;
};

type ChatUserState = Map<string, ChatUser>;

export type { ChatMessageState, Message, ChatUser, ChatUserState };
