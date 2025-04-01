type Message = {
  ownerId: boolean;
  recipientId: string;
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
  friend: boolean;
  online: boolean;
  blocked: boolean;
  email: string;
  lastMessage: string;
  unreadMessages: boolean;
};

type ChatUserState = Map<string, ChatUser>;

export type { ChatMessageState, Message, ChatUser, ChatUserState };
