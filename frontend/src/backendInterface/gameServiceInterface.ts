import {
  colog,
  gameServiceTypeGuards,
  GameServiceTypes,
  generateUniqueId,
  isDefined,
  jlog,
  matchmakingTypeGuards,
  MatchMakingTypes,
} from "transcendence";
import { buildBackendRoute } from "../utils/utils";

class GameServiceInterface {
  constructor() {
    throw new Error("This class cannot be instantiated.");
  }

  static websocket: WebSocket | null = null;

  static async createMatchOnServer(
    data: GameServiceTypes.StaticGameProperties
  ) {
    const address = buildBackendRoute({
      websocketOrApi: "api",
      service: "gameService",
      route: "/api/game/start",
    });
    try {
      const response = await fetch(address, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      });
      if (!response.ok) {
        throw new Error(`Couldn't create match on Server via API!`);
      }
    } catch (error) {
      console.error("Error:", error);
    }
  }

  static connect(): Promise<void> {
    if (!isDefined(this.websocket)) {
      return new Promise((resolve, reject) => {
        const address = buildBackendRoute({
          websocketOrApi: "ws",
          service: "gameService",
          route: "/ws",
          addClientIdAsQueryParam: true,
        });
        this.websocket = new WebSocket(address);
        this.websocket.onerror = (error) => {
          console.error("WebSocket error:", error);
          reject(new Error("WebSocket connection failed"));
        };

        this.websocket.onopen = () => {
          window.store.gameStore.updateGameStateState("waitingForClientReady");
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
    if (isDefined(window.store.gameStore.get().state === "running")) {
      this.sendMessageToServer({
        type: "clientLeftGame",
        data: {
          matchId: window.store.gameStore.get().matchId,
          playerId: window.store.userStore.get().id,
        },
      });
      window.store.gameStore.updateGameStateState("none");
    }
    if (isDefined(this.websocket)) {
      this.websocket.close();
      this.websocket = null;
    }
  }

  static handleMessage(event: MessageEvent) {
    const dataJson = JSON.parse(event.data);
    // colog("CLIENT RECEIVED THE FOLLOWING MESSAGE");
    // jlog(dataJson);
    if (gameServiceTypeGuards.isServerUpdateGameState(dataJson)) {
      this.handleServerUpdateGameState(dataJson);
    } else if (gameServiceTypeGuards.isServerGameIsOver(dataJson)) {
      this.handleServerGameIsOver(dataJson);
    } else if (gameServiceTypeGuards.isServerGameStarted(dataJson)) {
      this.handleServerGameStarted(dataJson);
    } else if (gameServiceTypeGuards.isServerError(dataJson)) {
      this.handleServerError(dataJson);
    } else if (gameServiceTypeGuards.isClientLeftGame(dataJson)) {
      this.handleClientLeftGame(dataJson);
    } else {
      colog(dataJson);
      throw new Error(
        "Client received unknown message from gameService server!"
      );
    }
  }

  static handleServerUpdateGameState(
    dataJson: GameServiceTypes.ServerUpdateGameState
  ) {
    window.store.gameStore.updateBallPosition(dataJson.data.ball);
  }

  static handleServerGameIsOver(dataJson: GameServiceTypes.ServerGameIsOver) {
    this.disconnect();
    window.store.notificationStore.updateAddNotification({
      id: generateUniqueId(),
      message: `Game ended, reason: ${dataJson.data.reason}`,
    });
  }

  static handleServerGameStarted(dataJson: GameServiceTypes.ServerGameStarted) {
    window.store.gameStore.updateGameStateState("running");
  }

  static handleServerError(dataJson: GameServiceTypes.ServerError) {
    colog("TEST!");
  }

  static handleClientLeftGame(dataJson: GameServiceTypes.ClientLeftGame) {
    colog("TEST!");
  }

  static sendMessageToServer(
    message: GameServiceTypes.AllGameServiceMessageTypes
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

export { GameServiceInterface };
