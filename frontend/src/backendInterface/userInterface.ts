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


  static async getAllUserDetails(id:string): AuthInterfaceAnswer {
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
        const res = await response.json() as AuthServiceTypes.UserType;
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
