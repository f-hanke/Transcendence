import {
  authErrorsToMsgMap,
  authServiceTypeGuards,
  AuthServiceTypes,
} from "transcendence";
import { buildApiRouteRelative, navigateToSite } from "../utils/utils";
import { ChatInterface } from "./chatInterface";
import { GameServiceInterface } from "./gameServiceInterface";
import { MatchMakingInterface } from "./matchmakingInterface";

type AuthInterfaceAnswer = Promise<{
  ok: boolean;
  errorMessage?: string;
}>;

class AuthInterface {
  constructor() {
    throw new Error("This class cannot be instantiated.");
  }

  static nameJwtInSessionStorage = "transcendenceJwt";

  static async registerClient(
    data: AuthServiceTypes.RegSubmissionBody
  ): AuthInterfaceAnswer {
    // const address = buildBackendRoute({
    //   websocketOrApi: "api",
    //   service: "authService",
    //   route: "/api/auth/register",
    // });
    const address = buildApiRouteRelative({
      service: "authService",
      route: "/api/auth/register",
    });
    try {
      const response = await fetch(address, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      });
      if (response.ok) {
        return this.success();
      } else return this.handleApiResponseError(response);
    } catch (error) {
      throw new Error(`Error: Fetch request to auth service`);
    }
  }

  static async login(
    data: AuthServiceTypes.LoginSubmissionBody
  ): AuthInterfaceAnswer {
    // const address = buildBackendRoute({
    //   websocketOrApi: "api",
    //   service: "authService",
    //   route: "/api/auth/login",
    // });
    const address = buildApiRouteRelative({
      service: "authService",
      route: "/api/auth/login",
    });
    try {
      const response = await fetch(address, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      });
      if (response.ok) {
        this.loginSucessful(await response.json());
        return this.success();
      } else return this.handleApiResponseError(response);
    } catch {
      throw new Error(`Error: Fetch request to auth service`);
    }
  }

  static async logout(): AuthInterfaceAnswer {
    // const address = buildBackendRoute({
    //   websocketOrApi: "api",
    //   service: "authService",
    //   route: "/api/auth/logout",
    // });
    const address = buildApiRouteRelative({
      service: "authService",
      route: `/api/auth/logout/${window.store.userStore.get().details.id}`,
    });
    await ChatInterface.disconnect();
    await GameServiceInterface.disconnect();
    await MatchMakingInterface.disconnect();
    try {
      const response = await fetch(address, {
        method: "GET",
        headers: {
          authorization: this.getAuthHeader(),
        },
      });
      if (response.ok) {
        this.logoutSucessful();
        return this.success();
      }
      if (response.status === 401) this.logoutSucessful();
      else;
      {
        setTimeout(() => this.logoutSucessful(), 2000);
        return this.handleApiResponseError(response);
      }
    } catch {
      throw new Error(`Error: Fetch request to auth service`);
    }
  }

  static async refresh(): AuthInterfaceAnswer {
    // const address = buildBackendRoute({
    //   websocketOrApi: "api",
    //   service: "authService",
    //   route: "/api/auth/refresh",
    // });
    const address = buildApiRouteRelative({
      service: "authService",
      route: "/api/auth/refresh",
    });
    try {
      const response = await fetch(address, {
        method: "GET",
        headers: {
          authorization: this.getAuthHeader(),
        },
      });
      if (response.ok) {
        this.refreshSucessful(await response.json());
        return this.success();
      } else return this.handleApiResponseError(response);
    } catch {
      throw new Error(`Error: Fetch request to auth service`);
    }
  }

  static async verify(updateUserId: boolean = false): AuthInterfaceAnswer {
    // const address = buildBackendRoute({
    //   websocketOrApi: "api",
    //   service: "authService",
    //   route: "/api/auth/verify-jwt",
    //   secure: true,
    // });
    // const address = buildApiRouteRelative({
    //   service: "authService",
    //   route: "/api/auth/verify-jwt"
    // });
    const address = "/api/auth/verify-jwt";
    try {
      const response = await fetch(address, {
        method: "GET",
        headers: {
          authorization: this.getAuthHeader(),
        },
      });
      if (response.ok) {
        this.verifySuccesful(await response.json(), updateUserId);
        return this.success();
      } else return this.handleApiResponseError(response);
    } catch {
      throw new Error(`Error: Fetch request to auth service`);
    }
  }

  static verifySuccesful(
    body: AuthServiceTypes.VerifySuccessResponseBody,
    updateUserId: boolean = false
  ) {
    window.colog("verify succesful!");
    if (updateUserId) {
      window.store.userStore.updateUserId(body.userId.toString());
    }
  }

  static refreshSucessful(body: AuthServiceTypes.AuthSuccessResponseBody) {
    window.colog("refresh succesful!");
    window.store.userStore.updateUserId(body.clientId.toString());
    sessionStorage.setItem(this.nameJwtInSessionStorage, body.jwtToken);
  }

  static loginSucessful(body: AuthServiceTypes.AuthSuccessResponseBody) {
    window.colog("login succesful!");
    window.store.userStore.updateUserId(body.clientId.toString());
    sessionStorage.setItem(this.nameJwtInSessionStorage, body.jwtToken);
    navigateToSite("/");
  }

  static logoutSucessful() {
    sessionStorage.removeItem(this.nameJwtInSessionStorage);
    window.store.reset();
    navigateToSite("/loginPage");
  }

  static success() {
    return { ok: true };
  }

  static async handleApiResponseError(response: Response): AuthInterfaceAnswer {
    window.colog("Verify JWT Endpoint says unauthorized!");
    if (response.status === 400) {
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
    } else {
      return {
        ok: false,
        errorMessage: `Couldn't register User for unknown reasons!`,
      };
    }
  }

  static getAuthHeader() {
    return `bearer ${
      sessionStorage.getItem(this.nameJwtInSessionStorage) as string
    }`;
  }
}

export { AuthInterface };

export type { AuthInterfaceAnswer };
