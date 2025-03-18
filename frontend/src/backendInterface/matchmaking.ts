import { isDefined } from "../utils/utils";

class InterfaceMatchMaking {
  constructor() {
    throw new Error("This class cannot be instantiated.");
  }

  static websocket: WebSocket | null = null;

  static test() {
    console.log("Static Test Method!");
  }

  static connect() {
    this.websocket = new WebSocket("ws://localhost:3000");
    
  }

  static disconnect() {
    if (isDefined(this.websocket)) {
      this.websocket.close();
      this.websocket = null;
    }
  }
}
