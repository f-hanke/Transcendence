import {
  authErrorsToMsgMap,
  authServiceTypeGuards,
  AuthServiceTypes,
} from "transcendence";
import { buildBackendRoute } from "../utils/utils";

class AuthInterface {
  constructor() {
    throw new Error("This class cannot be instantiated.");
  }

  static async registerClient(
    data: AuthServiceTypes.RegSubmissionBody
  ): Promise<{
    ok: boolean;
    errorMessage?: string;
  }> {
    const address = buildBackendRoute({
      websocketOrApi: "api",
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
        return { ok: true };
      } else if (response.status === 400) {
        const body = await response.json();
        if (authServiceTypeGuards.isErrorResponseBody(body)) {
          return {
            ok: false,
            errorMessage: authErrorsToMsgMap[body.reason],
          };
        } else {
          throw new Error(
            `Wrong bad request body send for registration endpoint!`
          );
        }
      } else {
        throw new Error(`Couldn't register User for unknown reasons!`);
      }
    } catch (error) {
      console.error("Error:", error);
      return Promise.resolve({
        ok: false,
        errorMessage: "Should never happen, check Code!",
      });
    }
  }

  // login
  // logout
  // checkTokenValidity
  // refresh Token
}

export { AuthInterface };
