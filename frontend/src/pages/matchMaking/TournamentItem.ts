import { isDefined, MatchMakingTypes } from "transcendence";
import { MatchMakingInterface } from "../../backendInterface/matchmakingInterface";
import { deepCopyObj } from "../../utils/utils";

type OptnsTournamentItem = {
  renderJoin: boolean;
  renderLeave: boolean;
};

class TournamentItem extends HTMLElement {
  data: MatchMakingTypes.Tournament;
  renderJoin?: boolean;
  renderLeave?: boolean;
  constructor() {
    super();
    this.data = {
      tournamentId: null,
      // player1displayName: null,
      // player2displayName: null,
      // player3displayName: null,
      // player4displayName: null,
      player1Id: null,
      player2Id: null,
      player3Id: null,
      player4Id: null,
      matchSemifinale1: null,
      matchSemifinale2: null,
      matchFinale: null,
      matchBronze: null,
      matchResultSemifinale1: null,
      matchResultSemifinale2: null,
      matchResultFinale: null,
      matchResultBronze: null,
      started: false,
      playedAt: null
    };
  }

  connectedCallback() {}

render() {
  const lang = window.store.languageStore.state.tournamentItem;

  const player1Name = this.data.player1Id
    ? window.store.playerNamesStore.getName(this.data.player1Id) || this.data.player1Id
    : "Empty";

  const player2Name = this.data.player2Id
    ? window.store.playerNamesStore.getName(this.data.player2Id) || this.data.player2Id
    : "Empty";

  const player3Name = this.data.player3Id
    ? window.store.playerNamesStore.getName(this.data.player3Id) || this.data.player3Id
    : "Empty";

  const player4Name = this.data.player4Id
    ? window.store.playerNamesStore.getName(this.data.player4Id) || this.data.player4Id
    : "Empty";
  
  this.innerHTML = `
    <li class="flex justify-between items-center bg-gray-600 p-2 rounded-lg text-white">
      <div>
        <div class="font-medium">${lang.tournamentId}: ${this.data.tournamentId}</div>
        <div class="font-medium">${lang.player1}: ${this.displayEmptySpot(player1Name)}</div>
        <div class="font-medium">${lang.player2}: ${this.displayEmptySpot(player2Name)}</div>
        <div class="font-medium">${lang.player3}: ${this.displayEmptySpot(player3Name)}</div>
        <div class="font-medium">${lang.player4}: ${this.displayEmptySpot(player4Name)}</div>
      </div>
      ${
        this.renderJoin
          ? `<button class="join-tournament-btn bg-blue-500 hover:bg-blue-600 py-1 px-3 rounded-lg">
              ▶ ${lang.join}
            </button>`
          : ""
      }
      ${
        this.renderLeave
          ? `<button class="leave-tournament-btn bg-red-600 hover:bg-red-700 text-white py-1 px-3 rounded-lg">
              ❌ ${lang.leave}
            </button>`
          : ""
      }
    </li>
  `;



  const joinButton = this.querySelector(".join-tournament-btn");
  if (joinButton) {
    joinButton.addEventListener("click", () => this.onJoinClick());
  }
  const leaveButton = this.querySelector(".leave-tournament-btn");
  if (leaveButton) {
    leaveButton.addEventListener("click", () => this.onLeaveClick());
  }
}


async setData(data: MatchMakingTypes.Tournament, optns: OptnsTournamentItem) {
  this.data = deepCopyObj(data);
  this.renderJoin = optns.renderJoin;
  this.renderLeave = optns.renderLeave;

  const ids = [data.player1Id, data.player2Id, data.player3Id, data.player4Id].filter(id => id != null);

  if (ids.length > 0) {
    await MatchMakingInterface.getNames(ids);
  }

  this.render();
}


  onJoinClick() {
    console.log(`Joining tournament: ${this.data.tournamentId}`);
    MatchMakingInterface.sendMessageToServer({
      type: "joinTournament",
      data: {
        playerId: window.store.userStore.get().details.id,
        tournamentId: this.data.tournamentId as string,
      },
    });
  }

  onLeaveClick() {
    console.log(`Leaving tournament: ${this.data.tournamentId}`);
    MatchMakingInterface.sendMessageToServer({
      type: "leaveTournament",
      data: {
        playerId: window.store.userStore.get().details.id,
        tournamentId: this.data.tournamentId as string,
      },
    });
  }

  displayEmptySpot(playerIdOrName: string | null) {
    if (!isDefined(playerIdOrName)) {
      return ">free<";
    }
    return playerIdOrName;
  }
}

customElements.define("tournament-item", TournamentItem);

export { TournamentItem };

export type { OptnsTournamentItem };
