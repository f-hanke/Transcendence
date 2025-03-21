import { colog, isDefined } from "transcendence";
import { MatchMakingInterface } from "../../backendInterface/matchmakingInterface";

class MatchItem extends HTMLElement {
  hostId: string | null;
  hostName: string | null;
  oponentId: string | null;
  oponentName: string | null;
  matchId: string | null;
  renderJoin: "0" | "1" | null;

  constructor() {
    super();
    this.hostId = null;
    this.hostName = null;
    this.oponentId = null;
    this.oponentName = null;
    this.matchId = null;
    this.renderJoin = null;
  }

  static get observedAttributes() {
    return [
      "hostId",
      "hostName",
      "oponentId",
      "oponentName",
      "matchId",
      "renderJoin",
    ];
  }

  connectedCallback() {
    this.updateAttributes();
    // this.logAllAttributes("ON CONNECTED!");
    this.render();
  }

  updateAttributes() {
    this.hostId = this.getAttribute("hostId");
    this.hostName = this.getAttribute("hostName");
    this.oponentId = this.getAttribute("oponentId");
    this.oponentName = this.getAttribute("oponentName");
    this.matchId = this.getAttribute("matchId");
    this.renderJoin = this.getAttribute("renderJoin") as "0" | "1" | null;
  }

  attributeChangedCallback(name: string, oldValue: string, newValue: string) {
    if (name === "hostId") this[name] = newValue;
    if (name === "hostName") this[name] = newValue;
    if (name === "oponentId") this[name] = newValue;
    if (name === "oponentName") this[name] = newValue;
    if (name === "matchId") this[name] = newValue;
    if (name === "renderJoin") this[name] = newValue as "1" | "0";
    if (
      isDefined("hostId") &&
      isDefined("hostName") &&
      isDefined("oponentId") &&
      isDefined("oponentName") &&
      isDefined("matchId") &&
      isDefined("renderJoin")
    )
      this.render();
  }

  // logAllAttributes(msg?: string) {
  //   msg ? colog(msg) : "";
  //   colog(`host: ${this.host}`);
  //   colog(`oponent: ${this.oponent}`);
  //   colog(`matchId: ${this.matchId}`);
  //   colog(`renderJoin: ${this.renderJoin}`);
  // }

  render() {
    this.innerHTML = `
        <li class="flex justify-between items-center bg-gray-600 p-2 rounded-lg text-white">
          <div>
            <div class="font-medium">Match ID: ${this.matchId}</div>
            <div class="font-medium">${this.hostName}'s Game</div>
            <div class="text-gray-300 text-sm">🟢 ${this.hostName} vs 🔴 ${
      this.oponentName
    }</div>
          </div>
          ${
            this.renderJoin === "1"
              ? `<button class="join-match-btn bg-blue-500 hover:bg-blue-600 py-1 px-3 rounded-lg">
                  ▶ Join
                </button>`
              : ""
          }
        </li>
      `;
    const joinButton = this.querySelector(".join-match-btn");
    if (joinButton) {
      joinButton.addEventListener("click", () => this.onJoinClick());
    }
  }

  onJoinClick() {
    console.log(`Joining match: ${this.matchId}`);
    MatchMakingInterface.sendMessageToServer({
      type: "joinGame",
      data: {
        matchId: this.matchId as string,
        hostId: this.hostId as string,
        oponentId: null,
      },
    });
  }
}

customElements.define("match-item", MatchItem);
