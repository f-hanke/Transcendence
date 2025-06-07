import {
  colog,
  gameServiceTypeGuards,
  GameServiceTypes,
  generateUniqueId,
  isDefined,
} from "transcendence";
import { buildApiRouteRelative, buildWsRoute } from "../utils/utils";
import { AuthInterface } from "./authInterface";
import { transStore } from "../state/store";

class GameServiceInterface {
  constructor() {
    throw new Error("This class cannot be instantiated.");
  }

  static correctUpdateHandlingFunction: (
    dataJson:
      | GameServiceTypes.ServerUpdateGameState
      | GameServiceTypes.serverUpdateGameStateRestAPI
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
          transStore.gameStore.updateGameStateState("waitingForClientReady");
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

  static disconnect(clientNotReady: boolean = false) {
    if (transStore.gameStore.get().state === "running") {
      try {
        this.sendMessageToServer({
          type: "clientLeftGame",
          data: {
            matchId: transStore.gameStore.get().matchId,
            playerId: transStore.userStore.get().details.id,
          },
        });
      } catch (err) {
        console.log("Unable to notify game service about closing connection!");
      }
    } else if (transStore.gameStore.get().state !== "none" && clientNotReady
    ) {
      try {
        this.sendMessageToServer({
          type: "clientLeftGameBeforeStart",
          data: {
            matchId: transStore.gameStore.get().matchId,
            playerId: transStore.userStore.get().details.id,
          },
        });
        console.log("SEND MESSAGE TO SERVER: clientLeftGameBeforeStart");
      } catch (err) {
        console.log(
          "Unable to notify game service about client not being ready!"
        );
      }
    } else {
    }
    transStore.gameStore.updateGameStateState("none");
    if (isDefined(this.websocket)) {
      this.websocket.close();
      this.websocket = null;
    }
  }

  static handleMessage(event: MessageEvent) {
    const dataJson = JSON.parse(event.data);
    console.log("RECEIVED MSG FROM GAME SERVICE");
    console.log(dataJson);
    if (
      gameServiceTypeGuards.isServerUpdateGameState(dataJson) ||
      gameServiceTypeGuards.isServerUpdateGameStateRestAPI(dataJson)
    ) {
      this.correctUpdateHandlingFunction(dataJson);
    } else if (gameServiceTypeGuards.isServerGameIsOver(dataJson)) {
      this.handleServerGameIsOver(dataJson);
    } else if (gameServiceTypeGuards.isServerGameStarted(dataJson)) {
      this.handleServerGameStarted(dataJson);
    } else if (gameServiceTypeGuards.isServerError(dataJson)) {
      this.handleServerError();
    } else if (gameServiceTypeGuards.isClientLeftGame(dataJson)) {
      this.handleClientLeftGame(dataJson);
    } else if (gameServiceTypeGuards.isClientLeftGameBeforeStart(dataJson)) {
      this.handleClientLeftGameBeforeStart();
    } else {
      colog(dataJson);
      throw new Error(
        "Client received unknown message from gameService server!"
      );
    }
  }

  static handleServerUpdateGameStateRemote(
    dataJson:
      | GameServiceTypes.ServerUpdateGameState
      | GameServiceTypes.serverUpdateGameStateRestAPI
  ) {
    if (dataJson.type === "serverUpdateGameState")
      transStore.gameStore.updateBallPositionNOponentPaddle(dataJson.data);
    else transStore.gameStore.updateBallPositionNBothPaddles(dataJson.data);
  }

  static handleServerUpdateGameStateLocalPvAi(
    dataJson:
      | GameServiceTypes.ServerUpdateGameState
      | GameServiceTypes.serverUpdateGameStateRestAPI
  ) {
    if (dataJson.type === "serverUpdateGameState")
      transStore.gameStore.updateBallPositionNOponentPaddle(dataJson.data);
    else transStore.gameStore.updateBallPositionNBothPaddles(dataJson.data);
  }

  static handleServerUpdateGameStateLocalPvp(
    dataJson:
      | GameServiceTypes.ServerUpdateGameState
      | GameServiceTypes.serverUpdateGameStateRestAPI
  ) {
    if (dataJson.type === "serverUpdateGameState")
      transStore.gameStore.updateBallPosition(dataJson.data);
    else transStore.gameStore.updateBallPositionNBothPaddles(dataJson.data);
  }

  static handleServerGameIsOver(dataJson: GameServiceTypes.ServerGameIsOver) {
    colog("GAME IS OVER RECEIVED!");
    colog(dataJson);
    this.disconnect();
    console.log(JSON.stringify(transStore.gameStore.get()));
    transStore.notificationStore.updateAddNotification({
      id: generateUniqueId(),
      message: GameServiceInterface.generateGameOverMsg(dataJson),
    });
  }

  static generateGameOverMsg(dataJson: GameServiceTypes.ServerGameIsOver) {
    const gameThatJustEnded = transStore.gameStore.get();
    const score1 = dataJson.data.player1.score;
    const score2 = dataJson.data.player2.score;
    const playerName1 = transStore.playerNamesStore.getName(
      dataJson.data.player1.id
    );
    let playerName2 = "";
    if (["localPvAi", "localPvP"].includes(gameThatJustEnded.typeOfGame)) {
      playerName2 = dataJson.data.player2.id;
    } else {
      playerName2 = transStore.playerNamesStore.getName(
        dataJson.data.player2.id
      );
    }
    const winner = score1 > score2 ? playerName1 : playerName2;
    const reason =
      transStore.languageStore.state.manageMatch.gameEndsMap[
        dataJson.data.reason as GameServiceTypes.PossibleGameEnds
      ];
    return transStore.languageStore.state.manageMatch.matchIsOver({
      name1: playerName1,
      name2: playerName2,
      score1: score1,
      score2: score2,
      winner: winner,
      reasonString: reason,
    });
  }

  static handleServerGameStarted(dataJson: GameServiceTypes.ServerGameStarted) {
    colog(dataJson);
    transStore.gameStore.updateGameStateState("running");
  }

  static handleClientLeftGameBeforeStart() {
    transStore.notificationStore.updateAddNotification({
      id: generateUniqueId(),
      message: `Other Player left the game before it started!`,
    });
    console.log("RECEIVED MESSAGE TO SERVER: clientLeftGameBeforeStart");
    transStore.gameStore.updateGameStateState("none");
  }

  static handleServerError() {
    transStore.notificationStore.updateAddNotification({
      id: generateUniqueId(),
      message: `Server Error!`,
    });
    transStore.gameStore.updateGameStateState("none");
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
    const gameType = transStore.gameStore.get().typeOfGame;
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
