declare namespace ChatServiceTypes {
  type Message = {
    authorId: string;
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

  // server user came online
  // server user gone offline
  // server new message
  // server friend request
  // client send friend request
  // client blocked user
  // client accepted friend request
  // client delete friend
  // client invite to play
  // client send message
  // 

  type AllChatMessageTypes = ServerSendUserList;

  type DataServerSendUserList = {
    chatUsers: ChatUser[];
  };

  type ServerSendUserList = {
    type: "updateOneGame";
    data: DataServerSendUserList;
  };
}

const chatServiceTypeGuards = {} as const;

export { ChatServiceTypes };
