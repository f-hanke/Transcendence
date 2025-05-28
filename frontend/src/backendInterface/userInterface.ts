import {
  authErrorsToMsgMap,
  authServiceTypeGuards,
  AuthServiceTypes,
  GameResultTypes,
} from "transcendence";
import { buildApiRouteRelative } from "../utils/utils";
import { AuthInterfaceAnswer } from "./authInterface";

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
        },
      });
      if (response.ok) {
        const res = (await response.json()) as AuthServiceTypes.UserType & {
          displayName: string;
        };
        res.displayName = res.display_name;
        if (updateId) window.store.userStore.updateUserId(res.id);
        window.store.userStore.updateUserSettings(res);
        window.store.userStore.updateUserImage(res.image);
        window.store.userStore.updateSetFetchNeeded(false);
        return {
          ok: true,
        };
      } else return this.handleApiResponseError(response);
    } catch {
      throw new Error(`Error: Fetch request to auth service`);
    }
  }

  /*Is this the methode to get the display names? LEo 28/05 */
  // static async getNames(body: string[]): AuthInterfaceAnswer {
  //   const address = buildApiRouteRelative({
  //     service: "authService",
  //     route: "/api/users/getusernames",
  //   });
  //   try {
  //     const response = await fetch(address, {
  //       method: "POST",
  //       headers: {
  //         "Content-Type": "application/json",
  //       },
  //       body: JSON.stringify(body),
  //     });
  //     if (response.ok) {
  //       //window.store.playerNamesStore.updateAddNames(await response.json());
  //       const idNameMap = await response.json(); // objet { id: displayName, ... }
  //       window.store.playerNamesStore.setIdToNameMap(idNameMap);
  //       return {
  //         ok: true,
  //       };
  //     } else return this.handleApiResponseError(response);
  //   } catch {
  //     throw new Error(`Error: Fetch request to auth service`);
  //   }
  // }
  static async getNames(body: string[]): Promise<AuthInterfaceAnswer> {
  const address = buildApiRouteRelative({
    service: "authService",
    route: "/api/users/getusernames",
  });
  try {
    const response = await fetch(address, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });
    if (response.ok) {
      const namesMap: Record<string, string> = await response.json();
      window.store.playerNamesStore.setIdToNameMap(namesMap);
      return { ok: true };
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

  static async getMatches(id: string,rerender: boolean = true) {
    const address = buildApiRouteRelative({
      service: "authService",
      route: `/api/users/${id}/matches`,
    });
    try {
      const response = await fetch(address, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
      });
      console.log(
        `GETTING MATCHES FOR USER ${id}`
      );
      console.log(response);
      if (response.ok) {
        const res = await response.json();
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

  static async getTournaments( id: string, rerender: boolean = true): AuthInterfaceAnswer {
    const address = buildApiRouteRelative({
      service: "authService",
      route: `/api/users/${
        id
      }/tournaments`,
    });
    try {
      const response = await fetch(address, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
      });
      console.log(
        `GETTING TOURNAMENTS FOR USER ${
          id
        }`
      );
      console.log(response);
      if (response.ok) {
        const res = await response.json();
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
