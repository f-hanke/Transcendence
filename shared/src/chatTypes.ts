// user mit details, last message
//

declare namespace ChatServiceTypes {
  type Message = {
    authorId: boolean;
    recipientId: string;
    message: string;
    date: string;
  };

  type ChatUser = {
    recipientId: string;
    displayName: string;
    image: string;
    friend: boolean;
    online: boolean;
    blocked: boolean;
    email: string;
    lastMessage: string;
    unreadMessages: boolean;
  };
}

const chatServiceTypeGuards = {} as const;

export { ChatServiceTypes };
