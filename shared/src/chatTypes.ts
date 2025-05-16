declare namespace ChatServiceTypes {
  type Message = {
    authorId: string;
    recipientId: string;
    message: string;
    date: string;
    type?: "sendGameInvite" | null;
  };

  type FriendRequestStatus =
    | null
    | "pendingClientInvite"
    | "pendingRecipientInvite";

  type ChatUser = {
    recipientId: string;
    displayName: string;
    image: Blob;
    friend: boolean;
    online: boolean;
    blocked: boolean;
    email: string;
    lastMessage: string;
    unreadMessages: boolean;
    friendRequestStatus: FriendRequestStatus;
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

  type AllChatMessageTypes =
    | ServerSendUserList
    | ServerSendChatHistory
    | ServerClientChangedOnlineStatus
    | ServerClientChangedOnlineStatus
    | SentMessage
    | UpdateFriendRequest;

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
    data: {
      recipientId: string;
      onlineStatus: boolean;
    };
  };

  type SentMessage = {
    type: "sentMessage";
    data: Message;
  };

  type ClientChangeBlockStatus = {
    clientId: string;
    recipientId: string;
    blockedStatus: boolean;
  };

  type UpdateFriendRequest = {
    type: "send" | "accept" | "declined" | "withdrawn" | "unfriended";
    recipientId: string;
  }

  type SendFriendRequestBody = {
    type: "send" | "accept" | "declined" | "withdrawn" | "unfriended";
    authorId: string;
    recipientId: string;
  };

  type InviteToPlayRequestBody = {
    authorId: string;
    recipientId: string;
    date: string;
  };

  type ErrorResponseBody = {
    reason: string;
  };
}

function isChatUser(obj: any): obj is ChatServiceTypes.ChatUser {
  return (
    typeof obj === "object" &&
    obj !== null &&
    typeof obj.recipientId === "string" &&
    typeof obj.displayName === "string" &&
    typeof obj.image === "object" &&
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

function isSentMessage(message: any): message is ChatServiceTypes.SentMessage {
  return (
    message?.type === "sentMessage" && message?.data
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

function isServerClientChangedOnlineStatus(
  message: any
): message is ChatServiceTypes.ServerClientChangedOnlineStatus {
  return (
    message?.type === "serverClientChangedOnlineStatus" && message?.data
    // && Array.isArray(message.data)
    //  &&isChatUser(message.data[0])
  );
}

function isSendFriendRequestBody(
  message: any
): message is ChatServiceTypes.SendFriendRequestBody {
  return (
    message?.recipientId &&
    message?.authorId &&
    message?.type &&
    typeof message.authorId === "string" &&
    typeof message.type === "string" &&
    typeof message.recipientId === "string"
    // && Array.isArray(message.data)
    //  &&isChatUser(message.data[0])
  );
}

function isClientChangeBlockStatus(
  message: any
): message is ChatServiceTypes.ClientChangeBlockStatus {
  return (
    message?.recipientId &&
    message?.clientId &&
    (message?.blockedStatus || message?.blockedStatus === false) &&
    typeof message.clientId === "string" &&
    typeof message.recipientId === "string" &&
    typeof message.blockedStatus === 'boolean'
  );
}

function isUpdateFriendRequest(
  message: any
): message is ChatServiceTypes.UpdateFriendRequest {
  return (
    message?.type &&
    ["send", "accept", "declined", "withdrawn", "unfriended"].includes(
      message.type
    ) &&
    message?.recipientId &&
    typeof message?.recipientId === "string"
  );
}

function isInviteToPlayRequestBody(obj: any): obj is ChatServiceTypes.InviteToPlayRequestBody {
  return (
    typeof obj === "object" &&
    obj !== null &&
    typeof obj.authorId === "string" &&
    typeof obj.recipientId === "string" &&
    typeof obj.date === "string"
  );
}

const chatServiceTypeGuards = {
  isUpdateFriendRequest,
  isSendFriendRequestBody,
  isServerSendUserList,
  isChatUser,
  isServerSendChatHistory,
  isSentMessage,
  isServerClientChangedOnlineStatus,
  isClientChangeBlockStatus,
  isInviteToPlayRequestBody
} as const;

export { chatServiceTypeGuards };

export { ChatServiceTypes };
