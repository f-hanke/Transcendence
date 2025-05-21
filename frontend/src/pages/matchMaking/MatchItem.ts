import { MatchMakingTypes } from "transcendence";
import { MatchMakingInterface } from "../../backendInterface/matchmakingInterface";

type OptnsMatchItem = {
  renderJoin: boolean;
  matchIsRunning: boolean;
};

class MatchItem extends HTMLElement {
  hostId: string;
  hostName: string;
  oponentId: string | null;
  oponentName: string | null;
  matchId: string;
  renderJoin: boolean;
  matchIsRunning: boolean;
  type: MatchMakingTypes.BasicGame["type"];
  invitedPlayerId: null | string;
  invitedPlayerName: null | string;
  tournamentId: string | null;
  constructor() {
    super();
    this.hostId = "";
    this.hostName = "";
    this.oponentId = "";
    this.oponentName = "";
    this.matchId = "";
    this.renderJoin = false;
    this.matchIsRunning = false;
    this.type = "public";
    this.invitedPlayerId = "";
    this.invitedPlayerName = "";
    this.tournamentId = null;
  }

  static get observedAttributes() {
    return [
      "hostId",
      "hostName",
      "oponentId",
      "oponentName",
      "matchId",
      "renderJoin",
      "matchIsRunning",
    ];
  }

  connectedCallback() {}

  render() {
    this.innerHTML = `
        <li class="flex justify-between items-center bg-gray-600 p-2 rounded-lg text-white">
          <div>
            <div class="font-medium">Match ID: ${this.matchId}</div>
            <div class="font-medium">${this.hostName}'s Game</div>
            <div class="text-gray-300 text-sm">🟢 ${this.hostName} vs 🔴 ${
      this.oponentName ? this.oponentName : "Waiting for oponent!"
    }</div>
            <div class="font-medium">Type of Game: ${this.type}</div>
            <div class="font-medium">InivitedPlayerId: ${
              this.invitedPlayerId
            }</div>
            <div class="font-medium">TournamentId: ${this.tournamentId}</div>
          </div>
          ${
            this.renderJoin
              ? `<button class="join-match-btn bg-blue-500 hover:bg-blue-600 py-1 px-3 rounded-lg">
                  ▶ Join
                </button>`
              : ""
          }
          <!-- "Waiting for oponent!" -->
          <!-- "Could be you!" -->
          ${
            this.matchIsRunning
              ? `<div class="relative top-0 right-0 h-full bg-red-500 text-white text-xs px-2 py-1 rounded-bl-lg">
                Game Running
              </div>`
              : ""
          }
        </li>
      `;
    const joinButton = this.querySelector(".join-match-btn");
    if (joinButton) {
      joinButton.addEventListener("click", () => this.onJoinClick());
    }
  }

  setData(
    data: MatchMakingTypes.BasicGame,
    optns: OptnsMatchItem,
  ) {
    this.hostId = data.hostId;
    this.hostName = data.hostId;
    this.oponentId = data.oponentId;
    this.oponentName = data.oponentId;
    this.matchId = data.matchId;
    this.renderJoin = optns.renderJoin;
    this.matchIsRunning = optns.matchIsRunning;
    this.type = data.type;
    this.invitedPlayerId = data.invitedPlayerId;
    this.invitedPlayerName = data.invitedPlayerId;
    this.tournamentId = data.tournamentId;
    this.render();
  }

  onJoinClick() {
    console.log(`Joining match: ${this.matchId}`);
    MatchMakingInterface.sendMessageToServer({
      type: "joinGame",
      data: {
        // to do here: set invited playeris, tournament id and type of game
        matchId: this.matchId as string,
        hostId: this.hostId as string,
        oponentId: window.store.userStore.get().details.id,
        invitedPlayerId: null,
        tournamentId: null,
        type: "public",
      },
    });
  }
}

customElements.define("match-item", MatchItem);

export { MatchItem };

export type { OptnsMatchItem };
