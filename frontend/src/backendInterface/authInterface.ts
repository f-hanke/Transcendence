import {
  AuthServiceTypes,
  colog,
  gameServiceTypeGuards,
  GameServiceTypes,
  generateUniqueId,
  isDefined,
  jlog,
  matchmakingTypeGuards,
  MatchMakingTypes,
} from "transcendence";
import { buildBackendRoute } from "../utils/utils";
import { RegisterStateSubmit } from "../state/registerStateTypes";

class AuthInterface {
  constructor() {
    throw new Error("This class cannot be instantiated.");
  }

  // register Client
  // login Client
  // logout Client

  static async registerClient(data: AuthServiceTypes.RegisterStateSubmit)
  {
    const address = buildBackendRoute({
      websocketOrApi: "api",
      service: "authService",
      route: "auth/register",
    });
    try {
      const response = await fetch(address, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      });
      if(response.status === 400)
      {
        // bad reuqest, tell user what went wrong
      }
      else if(response.status === 200)
      {
        // log user in
        // update user state and show landing page
      }
      else {
        throw new Error(`Couldn't register User for unknown reasons!`);
      }
    } catch (error) {
      console.error("Error:", error);
    }
  }


}

export { AuthInterface };
