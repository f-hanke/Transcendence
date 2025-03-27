import {
  colog,
  gameServiceTypeGuards,
  GameServiceTypes,
  isDefined,
  jlog,
  matchmakingTypeGuards,
  MatchMakingTypes,
} from "transcendence";

class GameServiceInterface {
  constructor() {
    throw new Error("This class cannot be instantiated.");
  }

  static websocket: WebSocket | null = null;

  static connect(): Promise<void> {

    const address = "http://10.15.204.5:3000/ws";

    return new Promise((resolve, reject) => {
      this.websocket = new WebSocket(
        `${address}?clientId=${window.store.userStore.get().id}`
      );
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
        jlog(event.data);
        // this.handleMessage(event);
      };
    });
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
    colog("CLIENT RECEIVED THE FOLLOWING MESSAGE");
    jlog(dataJson);

    gameServiceTypeGuards;

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
      jlog(dataJson);
      throw new Error(
        "Client received unknown message from gameService server!"
      );
    }
  }

  static handleServerUpdateGameState(
    dataJson: GameServiceTypes.ServerUpdateGameState
  ) {
    colog("TEST!");
  }

  static handleServerGameIsOver(dataJson: GameServiceTypes.ServerGameIsOver) {
    colog("TEST!");
  }

  static handleServerGameStarted(dataJson: GameServiceTypes.ServerGameStarted) {
    colog("TEST!");
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
