import { isDefined, MatchMakingTypes } from "transcendence";
import { MatchMakingInterface } from "../../backendInterface/matchmakingInterface";
import { deepCopyObj } from "../../utils/utils";
import { transStore } from "../../state/store";

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
      playedAt: null,
      playersWhoClickedToLeave: [],
    };
  }

  connectedCallback() {}

  render() {
  const lang = transStore.languageStore.state.tournamentItem;

  this.innerHTML = `
    <li class="flex justify-between items-center bg-gray-600 p-2 rounded-lg text-white">
      <div>
        <div class="font-medium">${lang.tournamentId}: ${this.data.tournamentId}</div>
        <div class="font-medium">${lang.player1}: ${this.displayEmptySpot(this.data.player1Id)}</div>
        <div class="font-medium">${lang.player2}: ${this.displayEmptySpot(this.data.player2Id)}</div>
        <div class="font-medium">${lang.player3}: ${this.displayEmptySpot(this.data.player3Id)}</div>
        <div class="font-medium">${lang.player4}: ${this.displayEmptySpot(this.data.player4Id)}</div>
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


  setData(data: MatchMakingTypes.Tournament, optns: OptnsTournamentItem) {
    this.data = deepCopyObj(data);
    this.renderJoin = optns.renderJoin;
    this.renderLeave = optns.renderLeave;
    this.render();
  }

  onJoinClick() {
    console.log(`Joining tournament: ${this.data.tournamentId}`);
    MatchMakingInterface.sendMessageToServer({
      type: "joinTournament",
      data: {
        playerId: transStore.userStore.get().details.id,
        tournamentId: this.data.tournamentId as string,
      },
    });
  }

  onLeaveClick() {
    console.log(`Leaving tournament: ${this.data.tournamentId}`);
    MatchMakingInterface.sendMessageToServer({
      type: "leaveTournament",
      data: {
        playerId: transStore.userStore.get().details.id,
        tournamentId: this.data.tournamentId as string,
      },
    });
  }

  displayEmptySpot(playerIdOrName: string | null) {
    if (!isDefined(playerIdOrName) || playerIdOrName === "" || playerIdOrName === null) {
      return ">free<";
    }
    return transStore.playerNamesStore.getName(playerIdOrName as string);
  }
}

customElements.define("tournament-item", TournamentItem);

export { TournamentItem };

export type { OptnsTournamentItem };
