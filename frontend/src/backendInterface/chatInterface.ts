import {
  chatServiceTypeGuards,
  ChatServiceTypes,
  colog,
  generateUniqueId,
  isDefined,
  MatchMakingTypes,
} from "transcendence";
import { buildBackendRoute } from "../utils/utils";

class ChatInterface {
  constructor() {
    throw new Error("This class cannot be instantiated.");
  }

  static websocket: WebSocket | null = null;


  static async sendUpdateBlockStatus(data: ChatServiceTypes.) {
    const address = buildBackendRoute({
      websocketOrApi: "api",
      service: "chatService",
      route: "/update-blocking-status",
    });
    try {
      const response = await fetch(address, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      });
      if (response.ok) {
        window.store.chatUserStore.updateChangeUserBlockedStatus(
          data.recipientId,
          data.status,
        );
      }
      if (!response.ok) {
        throw new Error(`Couldn't send friend request via API!`);
      }
    } catch (error) {
      console.error("Error:", error);
    }
  }


  static async sendFriendRequest(data: ChatServiceTypes.SendFriendRequestBody) {
    const address = buildBackendRoute({
      websocketOrApi: "api",
      service: "chatService",
      route: "/update-friend-request",
    });
    try {
      const response = await fetch(address, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      });
      if (response.ok) {
        window.store.chatUserStore.updateChangeUserFriendStatus(
          data.recipientId,
          data.type === "send" ? "newAuthorUpdateFromFrontend" : data.type
        );
      }
      if (!response.ok) {
        throw new Error(`Couldn't send friend request via API!`);
      }
    } catch (error) {
      console.error("Error:", error);
    }
  }

  static async requestChatHistory(recipientId: string) {
    colog("REQUEST CHAT HISTORY!");
    const address = buildBackendRoute({
      websocketOrApi: "api",
      service: "chatService",
      route: "/chat-history/",
      queryData: {
        recipientId: recipientId,
        clientId: window.store.userStore.get().id,
      },
    });
    colog(address);
    try {
      const response = await fetch(address, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
      });
      colog(response);
      const responseJson = await response.json();
      colog(responseJson);
      if (chatServiceTypeGuards.isServerSendChatHistory(responseJson)) {
        window.store.chatMessageStore.update({
          recipientId: recipientId,
          messages: responseJson.data,
        });
      } else {
        throw new Error(`Server Send Chat History Wrong Data Type received!`);
      }
      window.store;
      if (!response.ok) {
        colog("fetchin 2");
        throw new Error(`Couldn't create match on Server via API!`);
      }
    } catch (error) {
      console.error("Error:", error);
    }
  }

  static connect(): Promise<void> {
    if (!isDefined(this.websocket)) {
      colog("connecting to chat");
      const address = buildBackendRoute({
        websocketOrApi: "ws",
        service: "chatService",
        route: "/ws",
        addClientIdAsQueryParam: true,
      });
      colog(address);
      return new Promise((resolve, reject) => {
        this.websocket = new WebSocket(address);
        this.websocket.onerror = (error) => {
          console.error("WebSocket error:", error);
          reject(new Error("WebSocket connection failed"));
        };

        this.websocket.onopen = () => {
          console.log("WebSocket connected successfully!");
          resolve();
        };

        this.websocket.onclose = () => {
          console.log("WebSocket closed!");
          this.websocket = null;
        };

        this.websocket.onmessage = (event) => {
          this.handleMessage(event);
        };
      });
    } else return Promise.resolve();
  }

  static disconnect() {
    if (isDefined(this.websocket)) {
      colog("disconnecting from chat");
      this.websocket.close();
      this.websocket = null;
    }
  }

  static handleMessage(event: MessageEvent) {
    colog("Hi!");
    const dataJson = JSON.parse(event.data);
    colog(dataJson);
    if (chatServiceTypeGuards.isServerSendUserList(dataJson)) {
      this.handleServerSendUserList(dataJson);
    } else if (chatServiceTypeGuards.isSentMessage(dataJson)) {
      this.handleServerSentMessage(dataJson);
    } else if (
      chatServiceTypeGuards.isServerClientChangedOnlineStatus(dataJson)
    ) {
      this.handleServerClientChangedOnlineStatus(dataJson);
    } else if (chatServiceTypeGuards.isUpdateFriendRequest(dataJson)) {
      this.handleServerUpdateFriendRequest(dataJson);
    }
    // } else if (matchmakingTypeGuards.isServerStartGame(dataJson)) {
    //   this.handleServerStartGame(dataJson);
    // } else if (matchmakingTypeGuards.isServerUpdateOneGame(dataJson)) {
    //   this.handleServerUpdateOneGame(dataJson);
    // } else if (matchmakingTypeGuards.isClientCreateGame(dataJson)) {
    //   this.handleServerCreateGame(dataJson);
    // } else if (matchmakingTypeGuards.isClientLeaveGame(dataJson)) {
    //   this.handleServerLeaveGame(dataJson);
    else {
      colog("UNKNOWN DATA");
      // throw new Error(
      //   "Client received unknown message from matchmaking server!"
      // );
    }
  }

  static handleServerUpdateFriendRequest(
    dataJson: ChatServiceTypes.UpdateFriendRequest
  ) {
    window.store.notificationStore.updateAddNotification({
      id: generateUniqueId(),
      message: `UPDATE FRIEND STATUS ${dataJson.recipientId} ${dataJson.type} `,
    });
    colog("RECEIVED UPDATE FRIEND REQUEST FROM SERVER!");
    window.store.chatUserStore.updateChangeUserFriendStatus(
      dataJson.recipientId,
      dataJson.type
    );
  }

  static handleServerClientChangedOnlineStatus(
    dataJson: ChatServiceTypes.ServerClientChangedOnlineStatus
  ) {
    colog("RECEIVED CHANGE ONLINE STATUS MESSAGE!");
    window.store.chatUserStore.updateChangeUserOnlineStatus(
      dataJson.data.recipientId,
      dataJson.data.onlineStatus
    );
  }

  static handleServerSendUserList(
    dataJson: ChatServiceTypes.ServerSendUserList
  ) {
    colog("IPDATING USER LIST");
    window.store.chatUserStore.updateUserListFromArray(dataJson.data.chatUsers);
    this.requestChatHistory(dataJson.data.chatUsers[0].recipientId);
  }

  static handleServerSentMessage(dataJson: ChatServiceTypes.SentMessage) {
    const isOwnMessage =
      window.store.userStore.get().id === dataJson.data.authorId;
    if (isOwnMessage) this.handleServerSentOwnMessage(dataJson);
    else this.handleServerSentOthersMessage(dataJson);
  }

  static handleServerSentOwnMessage(dataJson: ChatServiceTypes.SentMessage) {
    colog("SENT OWN MESSAGE");
    colog(dataJson);
    window.store.chatUserStore.updateChangeUserLastMessage(
      dataJson.data.recipientId,
      dataJson.data.message
    );
    window.store.chatMessageStore.addMessage(
      dataJson.data.recipientId,
      dataJson.data
    );
  }

  static handleServerSentOthersMessage(dataJson: ChatServiceTypes.SentMessage) {
    const authorId = dataJson.data.authorId;
    window.store.chatUserStore.updateChangeUserLastMessageAndUnreadMessageStatus(
      authorId,
      dataJson.data.message
    );
    if (!window.store.chatUserStore.getIsBlocked(authorId)) {
      window.store.notificationStore.updateAddNotification({
        id: generateUniqueId(),
        message: `${dataJson.data.authorId} : ${dataJson.data.message}`,
      });
    }
    window.store.chatMessageStore.addMessage(authorId, dataJson.data);
  }

  static sendMessageToServer(message: ChatServiceTypes.AllChatMessageTypes) {
    console.log(this.websocket);
    if (
      isDefined(this.websocket) &&
      this.websocket.readyState === WebSocket.OPEN
    )
      this.websocket.send(JSON.stringify(message));
    else
      throw new Error(
        "Client tried to send message to server without having websocket connection!"
      );
  }
}

export { ChatInterface };
