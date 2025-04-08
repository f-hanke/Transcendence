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
  // client sendet: client connected to websocket
  // server sendet: an alle clients, client came online

  // server user gone offline
  // client sendet: client disconnected from websocket
  // server sendet: an alle clients, client gone offline

  // server new message
  // server friend request
  // client send friend request
  // client blocked user
  // client unblocked user
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
    type: "serverSendUserList";
    data: DataServerSendUserList;
  };

  type ServerSendChatHistory = {
    type: "serverSendChatHistory";
    data: Message[];
  };

  type ServerClientChangedOnlineStatus = {
    type: "serverClientChangedOnlineStatus";
    data: boolean;
  };
  type ClientSentMessage = {
    type: "clientSentMessage";
    data: Message;
  };

  type ServerSentMessage = {
    type: "serverSentMessage";
    data: Message;
  };

  type ClientChangeBlockStatus = {
    type: "clientChangeBlockStatus";
    data: {
      recipientId: string;
      blockedStatus: boolean;
    };
  };

  type ClientInviteToPlay = {
    type: "clientInviteToPlay";
    data: { recipientId: string };
  };

  

}

function isChatUser(obj: any): obj is ChatServiceTypes.ChatUser {
  return (
    typeof obj === "object" &&
    obj !== null &&
    typeof obj.recipientId === "string" &&
    typeof obj.displayName === "string" &&
    typeof obj.image === "string" &&
    typeof obj.friend === "boolean" &&
    typeof obj.online === "boolean" &&
    typeof obj.blocked === "boolean" &&
    typeof obj.email === "string" &&
    typeof obj.lastMessage === "string" &&
    typeof obj.unreadMessages === "boolean"
  );
}

function isServerSendUserList(
  message: any
): message is ChatServiceTypes.ServerSendUserList {
  return (
    message?.type === "serverSendUserList" && message?.data
    // && Array.isArray(message.data)
    //  &&isChatUser(message.data[0])
  );
}

function isServerSendChatHistory(
  message: any
): message is ChatServiceTypes.ServerSendChatHistory {
  return (
    message?.type === "serverSendChatHistory" && message?.data
    // && Array.isArray(message.data)
    //  &&isChatUser(message.data[0])
  );
}

const chatServiceTypeGuards = {
  isServerSendUserList,
  isChatUser,
  isServerSendChatHistory,
} as const;

export { chatServiceTypeGuards };

export { ChatServiceTypes };
