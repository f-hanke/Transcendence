import {
  authErrorsToMsgMap,
  authServiceTypeGuards,
  AuthServiceTypes,
  GameResultTypes,
} from "transcendence";
import { buildApiRouteRelative } from "../utils/utils";
import { AuthInterface, AuthInterfaceAnswer } from "./authInterface";
import { SupportedLanguages } from "../state/languageStateStore/languageStateTypes";

class UserInterface {
  constructor() {
    throw new Error("This class cannot be instantiated.");
  }

  static async getAllUserDetails(
    id: string,
    updateId: boolean = true
  ): AuthInterfaceAnswer {
    const address = buildApiRouteRelative({
      service: "authService",
      route: `/api/users/${id}`,
    });
    try {
      const response = await fetch(address, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          authorization: AuthInterface.getAuthHeader(),
        },
      });
      if (response.ok) {
        const res = (await response.json()) as AuthServiceTypes.UserType & {
          displayName: string;
        };
        res.displayName = res.display_name;
        if (updateId) window.store.userStore.updateUserId(res.id.toString());
        window.store.userStore.updateUserSettings(res);
        window.store.userStore.updateUserImage(res.image);
        window.store.userStore.updateSetFetchNeeded(false);
        window.store.languageStore.set(res.language as SupportedLanguages);
        return {
          ok: true,
        };
      } else return this.handleApiResponseError(response);
    } catch {
      throw new Error(`Error: Fetch request to auth service`);
    }
  }

  /*Is this the methode to get the display names? LEo 28/05 */
  static async getNames(body: string[]): AuthInterfaceAnswer {
    const address = buildApiRouteRelative({
      service: "authService",
      route: "/api/users/getusernames",
    });
    try {
      const response = await fetch(address, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          authorization: AuthInterface.getAuthHeader(),
        },
        body: JSON.stringify(body),
      });
      if (response.ok) {
        window.store.playerNamesStore.updateAddNames(await response.json());
        return {
          ok: true,
        };
      } else return this.handleApiResponseError(response);
    } catch {
      throw new Error(`Error: Fetch request to auth service`);
    }
  }

  static async updateDisplayName(
    body: AuthServiceTypes.UpdateDisplayNameBody
  ): AuthInterfaceAnswer {
    const address = buildApiRouteRelative({
      service: "authService",
      route: `/api/users/updatedisplayname/${
        window.store.userStore.get().details.id
      }`,
    });
    try {
      const response = await fetch(address, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          authorization: AuthInterface.getAuthHeader(),
        },
        body: JSON.stringify(body),
      });
      if (response.ok) {
        return {
          ok: true,
        };
      } else return this.handleApiResponseError(response);
    } catch {
      throw new Error(`Error: Fetch request to auth service`);
    }
  }

  static async updateUserEmail(
    body: AuthServiceTypes.UpdateEmailBody
  ): AuthInterfaceAnswer {
    const address = buildApiRouteRelative({
      service: "authService",
      route: `/api/users/updateemail/${
        window.store.userStore.get().details.id
      }`,
    });
    try {
      const response = await fetch(address, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          authorization: AuthInterface.getAuthHeader(),
        },
        body: JSON.stringify(body),
      });
      if (response.ok) {
        return {
          ok: true,
        };
      } else return this.handleApiResponseError(response);
    } catch {
      throw new Error(`Error: Fetch request to auth service`);
    }
  }

  static async updateUserPassword(
    body: AuthServiceTypes.UpdatePasswordBody
  ): AuthInterfaceAnswer {
    const address = buildApiRouteRelative({
      service: "authService",
      route: `/api/users/updatepassword/${
        window.store.userStore.get().details.id
      }`,
    });
    try {
      const response = await fetch(address, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          authorization: AuthInterface.getAuthHeader(),
        },
        body: JSON.stringify(body),
      });
      if (response.ok) {
        return {
          ok: true,
        };
      } else return this.handleApiResponseError(response);
    } catch {
      throw new Error(`Error: Fetch request to auth service`);
    }
  }

  static async updateUserLanguage(
    body: AuthServiceTypes.UpdateLanguageBody
  ): AuthInterfaceAnswer {
    const address = buildApiRouteRelative({
      service: "authService",
      route: `/api/users/updatelanguage/${
        window.store.userStore.get().details.id
      }`,
    });
    try {
      const response = await fetch(address, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          authorization: AuthInterface.getAuthHeader(),
        },
        body: JSON.stringify(body),
      });
      if (response.ok) {
        return {
          ok: true,
        };
      } else return this.handleApiResponseError(response);
    } catch {
      throw new Error(`Error: Fetch request to auth service`);
    }
  }

  static async updateUserImage(
    body: AuthServiceTypes.UpdateImageBody
  ): AuthInterfaceAnswer {
    const address = buildApiRouteRelative({
      service: "authService",
      route: `/api/users/updateimage/${
        window.store.userStore.get().details.id
      }`,
    });
    try {
      const response = await fetch(address, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          authorization: AuthInterface.getAuthHeader(),
        },
        body: JSON.stringify(body),
      });
      if (response.ok) {
        return {
          ok: true,
        };
      } else return this.handleApiResponseError(response);
    } catch {
      throw new Error(`Error: Fetch request to auth service`);
    }
  }

  static async getMatches(id: string, rerender: boolean = true) {
    const address = buildApiRouteRelative({
      service: "authService",
      route: `/api/users/${id}/matches`,
    });
    try {
      const response = await fetch(address, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          authorization: AuthInterface.getAuthHeader(),
        },
      });
      console.log(`GETTING MATCHES FOR USER ${id}`);
      if (response.ok) {
        // const res = await response.json();
        const res: GameResultTypes.MatchResult[] =getMatchResultsMockup();
          window.store.userStore.updateMatchHistory(res, rerender);
        console.log(res);
        return {
          ok: true,
          matches: res as GameResultTypes.MatchResult[],
        };
      } else return this.handleApiResponseError(response);
    } catch {
      throw new Error(`Fetching Matches`);
    }
  }

  static async getTournaments(
    id: string,
    rerender: boolean = true
  ): AuthInterfaceAnswer {
    const address = buildApiRouteRelative({
      service: "authService",
      route: `/api/users/${id}/tournaments`,
    });
    try {
      const response = await fetch(address, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          authorization: AuthInterface.getAuthHeader(),
        },
      });
      console.log(`GETTING TOURNAMENTS FOR USER ${id}`);
      console.log(response);
      if (response.ok) {
        // const res = await response.json();
        const res: GameResultTypes.TournamentResult[] = getTournamentResultsMockup();
        window.store.userStore.updateTournamentHistory(res, rerender);
        console.log(res);
        return {
          ok: true,
        };
      } else return this.handleApiResponseError(response);
    } catch {
      throw new Error(`Fetching Tournaments`);
    }
  }

  static async handleApiResponseError(response: Response): AuthInterfaceAnswer {
    const body = await response.json();
    if (authServiceTypeGuards.isErrorResponseBody(body)) {
      return {
        ok: false,
        errorMessage: authErrorsToMsgMap[body.reason],
      };
    } else {
      return {
        ok: false,
        errorMessage: `Wrong bad request body send for registration endpoint!`,
      };
    }
  }
}

export { UserInterface };

function getMatchResultsMockup() {
  return [
    {
      player1Id: "3",
      player2Id: "4",
      matchId: "10",
      createdAt: new Date().toISOString(),
      player1Score: 2,
      player2Score: 4,
      winnerId: "4",
    },
    {
      player1Id: "3",
      player2Id: "4",
      matchId: "10",
      createdAt: new Date().toISOString(),
      player1Score: 2,
      player2Score: 4,
      winnerId: "4",
    },
    {
      player1Id: "3",
      player2Id: "4",
      matchId: "10",
      createdAt: new Date().toISOString(),
      player1Score: 2,
      player2Score: 4,
      winnerId: "4",
    },
  ];
}

function getTournamentResultsMockup()
{
return [
          {
            createdAt: new Date().toISOString(),
            rank1PlayerId: "1",
            rank2PlayerId: "2",
            rank3PlayerId: "3",
            rank4PlayerId: "4",
            tournamentId: "123",
            matchSemifinale1: {
              createdAt: new Date().toISOString(),
              matchId: "123",
              player1Id: "1",
              player2Id: "2",
              player1Score: 4,
              player2Score: 2,
              winnerId: "1",
            },
            matchSemifinale2: {
              createdAt: new Date().toISOString(),
              matchId: "123",
              player1Id: "3",
              player2Id: "4",
              player1Score: 4,
              player2Score: 2,
              winnerId: "3",
            },
            matchBronze: {
              createdAt: new Date().toISOString(),
              matchId: "123",
              player1Id: "2",
              player2Id: "4",
              player1Score: 4,
              player2Score: 2,
              winnerId: "2",
            },
            matchFinale: {
              createdAt: new Date().toISOString(),
              matchId: "123",
              player1Id: "1",
              player2Id: "3",
              player1Score: 4,
              player2Score: 2,
              winnerId: "1",
            },
          },
          {
            createdAt: new Date().toISOString(),
            rank1PlayerId: "1",
            rank2PlayerId: "2",
            rank3PlayerId: "3",
            rank4PlayerId: "4",
            tournamentId: "123",
            matchSemifinale1: {
              createdAt: new Date().toISOString(),
              matchId: "123",
              player1Id: "1",
              player2Id: "2",
              player1Score: 4,
              player2Score: 2,
              winnerId: "1",
            },
            matchSemifinale2: {
              createdAt: new Date().toISOString(),
              matchId: "123",
              player1Id: "3",
              player2Id: "4",
              player1Score: 4,
              player2Score: 2,
              winnerId: "3",
            },
            matchBronze: {
              createdAt: new Date().toISOString(),
              matchId: "123",
              player1Id: "2",
              player2Id: "4",
              player1Score: 4,
              player2Score: 2,
              winnerId: "2",
            },
            matchFinale: {
              createdAt: new Date().toISOString(),
              matchId: "123",
              player1Id: "1",
              player2Id: "3",
              player1Score: 4,
              player2Score: 2,
              winnerId: "1",
            },
          },
          {
            createdAt: new Date().toISOString(),
            rank1PlayerId: "1",
            rank2PlayerId: "2",
            rank3PlayerId: "3",
            rank4PlayerId: "4",
            tournamentId: "123",
            matchSemifinale1: {
              createdAt: new Date().toISOString(),
              matchId: "123",
              player1Id: "1",
              player2Id: "2",
              player1Score: 4,
              player2Score: 2,
              winnerId: "1",
            },
            matchSemifinale2: {
              createdAt: new Date().toISOString(),
              matchId: "123",
              player1Id: "3",
              player2Id: "4",
              player1Score: 4,
              player2Score: 2,
              winnerId: "3",
            },
            matchBronze: {
              createdAt: new Date().toISOString(),
              matchId: "123",
              player1Id: "2",
              player2Id: "4",
              player1Score: 4,
              player2Score: 2,
              winnerId: "2",
            },
            matchFinale: {
              createdAt: new Date().toISOString(),
              matchId: "123",
              player1Id: "1",
              player2Id: "3",
              player1Score: 4,
              player2Score: 2,
              winnerId: "1",
            },
          },
        ];
}
