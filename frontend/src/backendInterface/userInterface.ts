import {
  authErrorsToMsgMap,
  authServiceTypeGuards,
  AuthServiceTypes,
} from "transcendence";
import { buildApiRouteRelative } from "../utils/utils";
import { AuthInterfaceAnswer } from "./authInterface";

class UserInterface {
  constructor() {
    throw new Error("This class cannot be instantiated.");
  }

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
