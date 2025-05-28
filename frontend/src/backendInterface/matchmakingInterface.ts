import {
  colog,
  isDefined,
  isOwnTournament,
  jlog,
  matchmakingTypeGuards,
  MatchMakingTypes,
} from "transcendence";
import {  buildApiRouteRelative, buildWsRoute, navigateToSite } from "../utils/utils";
import { AuthInterfaceAnswer } from "./authInterface";

class MatchMakingInterface {
  constructor() {
    throw new Error("This class cannot be instantiated.");
  }

  static websocket: WebSocket | null = null;

  static async getCurrentTournament(): AuthInterfaceAnswer {
    // const address = buildBackendRoute({
    //   websocketOrApi: "api",
    //   service: "matchmakingService",
    //   route: `/matchmaking/playertournament/${
    //     window.store.userStore.get().details.id
    //   }`,
    // });
    const address = buildApiRouteRelative({
      service: "matchmakingService",
    route: `/matchmaking/playertournament/${window.store.userStore.get().details.id}`,
    });
    try {
      const response = await fetch(address, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
      });
      if (response.ok) {
        const res = await response.json();
        colog("MILOS ANSWER");
        colog(res);
        window.store.currentTournamentStore.updateCurrent(res);
        return {
          ok: true,
        };
      } else return (await response.json()).error;
    } catch {
      throw new Error(`Error: Fetch request to Remote service`);
    }
  }
    static async getNames(ids: string[]): Promise<void> {
    const address = buildApiRouteRelative({
      service: "authService",
      route: "/api/users/getusernames",
    });

    try {
      const response = await fetch(address, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(ids),
      });

      if (!response.ok) {
        throw new Error("Erreur lors de la récupération des noms");
      }

      const namesMap: Record<string, string> = await response.json();
      // Met à jour le store playerNamesStore avec le mapping ID => displayName
      window.store.playerNamesStore.setIdToNameMap(namesMap);
    } catch (error) {
      console.error("Erreur fetch getNames:", error);
    }
  }

  static connect(): Promise<void> {
    if (!isDefined(this.websocket)) {
      // const address = buildBackendRoute({
      //   websocketOrApi: "ws",
      //   service: "matchmakingService",
      //   route: "",
      //   addClientIdAsQueryParam: true,
      //   secure: false,
      // });
      // console.log("address here!");
      // console.log(address);
      const address = buildWsRoute({
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
          const ownMatch = window.store.matchmakingStore.get().ownMatch;
          if (isDefined(ownMatch) && ownMatch.needsServerInitiation) {
            this.sendMessageToServer({
              type: "createGame",
              data: {
                matchId: ownMatch.matchId,
                hostId: ownMatch.hostId,
                oponentId: ownMatch.oponentId,
                invitedPlayerId: ownMatch.invitedPlayerId,
                tournamentId: ownMatch.tournamentId,
                type: ownMatch.type,
              },
            });
          }
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
    } else if (matchmakingTypeGuards.isServerUpdateOneTournament(dataJson)) {
      this.handleServerUpdateOneTournament(dataJson);
    } else if (matchmakingTypeGuards.isServerStartTournament(dataJson)) {
      this.handleServerStartTournament(dataJson);
    } else {
      jlog(dataJson);
      throw new Error(
        "Client received unknown message from matchmaking server!"
      );
    }
  }

  static handleServerStartTournament(
    dataJson: MatchMakingTypes.ServerStartTournament
  ) {
    console.log("Server Start Tournament!");
    if (isOwnTournament(dataJson.data, window.store.userStore.get().details.id))
      navigateToSite("currentTournament");
    else window.store.matchmakingStore.updateOneTournament(dataJson.data);
  }

  static handleServerUpdateOneTournament(
    dataJson: MatchMakingTypes.ServerUpdateOneTournament
  ) {
    colog("serverupdateOnetournament");
    window.store.matchmakingStore.updateOneTournament(dataJson.data);
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
    window.store.gameStore.updateGameStateState("matchmakingSuccessful");
    const isSelfHosted =
      dataJson.data.hostId === window.store.userStore.get().details.id;
    window.store.gameStore.updateMatchMakingSuccessful({
      hostId: dataJson.data.hostId,
      oponentId: dataJson.data.oponentId,
      selfHosted: isSelfHosted,
      matchId: dataJson.data.matchId,
      playerLeftPaddleId: dataJson.data.hostId,
      playerRightPaddleId: dataJson.data.oponentId,
    });
    window.store.gameStore.updateGameStateTypeOfGame("remote", false);
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
