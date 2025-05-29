import {
  colog,
  gameServiceTypeGuards,
  GameServiceTypes,
  generateUniqueId,
  isDefined,
} from "transcendence";
import { buildApiRouteRelative, buildWsRoute } from "../utils/utils";
import { AuthInterface } from "./authInterface";

class GameServiceInterface {
  constructor() {
    throw new Error("This class cannot be instantiated.");
  }

  static correctUpdateHandlingFunction: (
    dataJson: GameServiceTypes.ServerUpdateGameState | GameServiceTypes.serverUpdateGameStateRestAPI
  ) => void = GameServiceInterface.handleServerUpdateGameStateRemote;

  static websocket: WebSocket | null = null;

  static async createMatchOnServer(
    data: GameServiceTypes.StaticGameProperties
  ) {
    colog("creating match on server");
    // const address = buildBackendRoute({
    //   websocketOrApi: "api",
    //   service: "gameService",
    //   route: "/api/game/start",
    // });
    const address = buildApiRouteRelative({
      service: "gameService",
      route: "/api/game/start",
    });
    try {
      const response = await fetch(address, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          authorization: AuthInterface.getAuthHeader(),
        },
        body: JSON.stringify(data),
      });
      colog("response");
      colog(response);
      if (!response.ok) {
        throw new Error(`Couldn't create match on Server via API!`);
      }
    } catch (error) {
      console.error("Error:", error);
    }
  }

  static connect(): Promise<void> {
    if (!isDefined(this.websocket)) {
      this.pickCorrectServerUpdateHandlingFunction();
      return new Promise((resolve, reject) => {
        // const address = buildBackendRoute({
        //   websocketOrApi: "ws",
        //   service: "gameService",
        //   route: "/ws",
        //   addClientIdAsQueryParam: true,
        // });
        const address = buildWsRoute({
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
          playerId: window.store.userStore.get().details.id,
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
    if (gameServiceTypeGuards.isServerUpdateGameState(dataJson) || gameServiceTypeGuards.isServerUpdateGameStateRestAPI(dataJson)) {
      this.correctUpdateHandlingFunction(dataJson);
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

  static handleServerUpdateGameStateRemote(
    dataJson:GameServiceTypes.ServerUpdateGameState | GameServiceTypes.serverUpdateGameStateRestAPI
  ) {
    if (dataJson.type === "serverUpdateGameState")
      window.store.gameStore.updateBallPositionNOponentPaddle(dataJson.data);
    else window.store.gameStore.updateBallPositionNBothPaddles(dataJson.data);
  }

  static handleServerUpdateGameStateLocalPvAi(
    dataJson: GameServiceTypes.ServerUpdateGameState | GameServiceTypes.serverUpdateGameStateRestAPI
  ) {
    if (dataJson.type === "serverUpdateGameState")
      window.store.gameStore.updateBallPositionNOponentPaddle(dataJson.data);
    else window.store.gameStore.updateBallPositionNBothPaddles(dataJson.data);
  }

  static handleServerUpdateGameStateLocalPvp(
    dataJson: GameServiceTypes.ServerUpdateGameState | GameServiceTypes.serverUpdateGameStateRestAPI
  ) {
    if (dataJson.type === "serverUpdateGameState")
      window.store.gameStore.updateBallPosition(dataJson.data);
    else window.store.gameStore.updateBallPositionNBothPaddles(dataJson.data);
  }

  static handleServerGameIsOver(dataJson: GameServiceTypes.ServerGameIsOver) {
    colog("GAME IS OVER RECEIVED!");
    this.disconnect();
    window.store.notificationStore.updateAddNotification({
      id: generateUniqueId(),
      message: `Game ended, reason: ${dataJson.data.reason}`,
    });
  }

  static handleServerGameStarted(dataJson: GameServiceTypes.ServerGameStarted) {
    colog(dataJson);
    window.store.gameStore.updateGameStateState("running");
  }

  static handleServerError(dataJson: GameServiceTypes.ServerError) {
    colog(dataJson);
    colog("SERVER ERROR!");
  }

  static handleClientLeftGame(dataJson: GameServiceTypes.ClientLeftGame) {
    colog(dataJson);
    colog("CLIENT LEFT GAME!");
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

  static pickCorrectServerUpdateHandlingFunction() {
    const gameType = window.store.gameStore.get().typeOfGame;
    switch (gameType) {
      case "localPvP":
        this.correctUpdateHandlingFunction =
          this.handleServerUpdateGameStateLocalPvp;
        break;
      case "localPvAi":
        this.correctUpdateHandlingFunction =
          this.handleServerUpdateGameStateLocalPvAi;
        break;
      case "remote":
        this.correctUpdateHandlingFunction =
          this.handleServerUpdateGameStateRemote;
        break;
    }
  }
}

export { GameServiceInterface };
