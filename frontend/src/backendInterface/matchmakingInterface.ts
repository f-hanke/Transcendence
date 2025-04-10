import {
  colog,
  isDefined,
  jlog,
  matchmakingTypeGuards,
  MatchMakingTypes,
} from "transcendence";
import { buildBackendRoute } from "../utils/utils";

class MatchMakingInterface {
  constructor() {
    throw new Error("This class cannot be instantiated.");
  }

  static websocket: WebSocket | null = null;

  static connect(): Promise<void> {
    if (!isDefined(this.websocket)) {
      const address = buildBackendRoute({
        websocketOrApi: "ws",
        service: "matchmakingService",
        route: "",
        addClientIdAsQueryParam: true,
      });
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
    const ownMatch = window.store.matchmakingStore.get().ownMatch;
    if (isDefined(ownMatch)) {
      this.sendMessageToServer({
        type: "deleteGame",
        data: ownMatch as MatchMakingTypes.BasicGame,
      });
      window.store.matchmakingStore.deleteGame(ownMatch);
    }
    if (isDefined(this.websocket)) {
      this.websocket.close();
      this.websocket = null;
    }
  }

  static handleMessage(event: MessageEvent) {
    const dataJson = JSON.parse(event.data);
    colog("CLIENT RECEIVED THE FOLLOWING MESSAGE");
    jlog(dataJson);
    if (matchmakingTypeGuards.isServerUpdateGames(dataJson)) {
      this.handleServerUpdatedGames(dataJson);
    } else if (matchmakingTypeGuards.isClientDeleteGame(dataJson)) {
      this.handleServerDeleteGame(dataJson);
    } else if (matchmakingTypeGuards.isServerStartGame(dataJson)) {
      this.handleServerStartGame(dataJson);
    } else if (matchmakingTypeGuards.isServerUpdateOneGame(dataJson)) {
      this.handleServerUpdateOneGame(dataJson);
    } else if (matchmakingTypeGuards.isClientCreateGame(dataJson)) {
      this.handleServerCreateGame(dataJson);
    } else if (matchmakingTypeGuards.isClientLeaveGame(dataJson)) {
      this.handleServerLeaveGame(dataJson);
    } else {
      jlog(dataJson);
      throw new Error(
        "Client received unknown message from matchmaking server!"
      );
    }
  }

  static handleServerUpdatedGames(
    dataJson: MatchMakingTypes.ServerUpdateGames
  ) {
    window.store.matchmakingStore.updateFromAllMatches(dataJson.data);
  }

  static handleServerDeleteGame(dataJson: MatchMakingTypes.ClientDeleteGame) {
    window.store.matchmakingStore.deleteGame(dataJson.data);
  }

  static handleServerStartGame(dataJson: MatchMakingTypes.ServerStartGame) {
    const isSelfHosted = dataJson.data.hostId === window.store.userStore.get().id;
    window.store.gameStore.updateMatchMakingSuccessful({
      hostId: dataJson.data.hostId,
      oponentId: dataJson.data.oponentId,
      selfHosted: isSelfHosted,
      matchId: dataJson.data.matchId,
      playerLeftPaddleId: dataJson.data.hostId,
      playerRightPaddleId: dataJson.data.oponentId,
    });
    window.store.gameStore.updateGameStateTypeOfGame("remote");
    window.store.gameStore.updateGameStateState("matchmakingSuccessful");
  }

  static handleServerUpdateOneGame(
    dataJson: MatchMakingTypes.ServerUpdateOneGame
  ) {
    window.store.matchmakingStore.updateOneGame(dataJson.data);
  }

  static handleServerCreateGame(dataJson: MatchMakingTypes.ClientCreateGame) {
    window.store.matchmakingStore.createGame(dataJson.data);
  }

  static handleServerLeaveGame(dataJson: MatchMakingTypes.ClientLeaveGame) {
    window.store.matchmakingStore.deleteGame(dataJson.data);
  }

  static sendMessageToServer(
    message: MatchMakingTypes.AllMatchMakingMessageTypes
  ) {
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

export { MatchMakingInterface };
