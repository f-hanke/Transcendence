import { generateUniqueId, isDefined, MatchMakingTypes } from "transcendence";
import { MatchMakingInterface } from "../../backendInterface/matchmakingInterface";
import { createHtmlElementFromString, navigateToSite } from "../../utils/utils";
import { MatchItem, OptnsMatchItem } from "./MatchItem";
import { OptnsTournamentItem, TournamentItem } from "./TournamentItem";
import { transStore } from "../../state/store";

class MatchMaking extends HTMLElement {
  unsubscribeMatchmakingState: null | (() => void);
  unsubscribeGameState: null | (() => void);
  unsubscribeLanguage: null | (() => void);
  constructor() {
    super();
    this.unsubscribeGameState = null;
    this.unsubscribeMatchmakingState = null;
    this.unsubscribeLanguage = null;
  }

  connectedCallback() {
    this.render();
    this.unsubscribeMatchmakingState = transStore.matchmakingStore.subscribe(
      this.render.bind(this)
    );
    this.unsubscribeGameState = transStore.gameStore.subscribe(
      this.render.bind(this)
    );
    this.unsubscribeLanguage = transStore.languageStore.subscribe(() =>
      this.render()
    );
    // here update own tournament status
    // MatchMakingInterface.connect();
  }

  disconnectedCallback() {
    if (this.unsubscribeMatchmakingState) this.unsubscribeMatchmakingState();
    if (this.unsubscribeGameState) this.unsubscribeGameState();
    if (this.unsubscribeLanguage) this.unsubscribeLanguage();
    MatchMakingInterface.disconnect();
  }

  render() {
    MatchMakingInterface.connect();
    const containerStyle = `mb-6 p-4 bg-gray-700 rounded-lg`;
    const ownMatch = transStore.matchmakingStore.get().ownMatch;
    const ownMatchOpen = isDefined(ownMatch);
    if (transStore.gameStore.get().state === "matchmakingSuccessful")
      navigateToSite("manageMatch");
    this.innerHTML = `
      <div class="p-4 w-full h-full mx-auto bg-gray-800 text-white rounded-lg shadow-lg">
        <h2 class="text-xl font-semibold mb-4">${transStore.languageStore.state.matchMaking.matchMaking}</h2>
        <!-- Create a Match -->
        <div id="containerOwnMatch" class="${containerStyle}">
          <h3 class="text-lg font-medium mb-2">${transStore.languageStore.state.matchMaking.yourOwnMatchHeading}</h3>
        </div>

        <!-- List of Other Matches -->
        <div id="containerPrivateMatches" class="${containerStyle}">
          <h3 class="text-lg font-medium mb-2">${transStore.languageStore.state.matchMaking.privateMatches}</h3>
        </div>
        <div id="containerPublicMatches" class="${containerStyle}">
          <h3 class="text-lg font-medium mb-2">${transStore.languageStore.state.matchMaking.publicMatches}</h3>
        </div>
        <div id="containerTournament" class="${containerStyle}">
          <h3 class="text-lg font-medium mb-2">${transStore.languageStore.state.matchMaking.tournaments}</h3>
        </div>
      </div>
    `;

    const matchGroups = transStore.matchmakingStore.getMatchGroups();

    const ownMatchContainer = document.querySelector(
      "#containerOwnMatch"
    ) as HTMLDivElement;
    const publicMatchesContainer = document.querySelector(
      "#containerPublicMatches"
    ) as HTMLDivElement;
    const privateMatchesContainer = document.querySelector(
      "#containerPrivateMatches"
    ) as HTMLDivElement;

    const tournamentContainer = document.querySelector(
      "#containerTournament"
    ) as HTMLDivElement;

    if (ownMatchOpen) {
      this.createAndAppendMatch(ownMatchContainer, ownMatch, {
        matchIsRunning: false,
        renderJoin: false,
      });
      this.createAppendDeleteGameBtn(ownMatchContainer);
    } else {
      this.createAppendCreateGameBtn(ownMatchContainer);
    }

    for (const match of matchGroups.private) {
      this.createAndAppendMatch(privateMatchesContainer, match, {
        matchIsRunning: false,
        renderJoin: true,
      });
    }
    for (const match of matchGroups.public) {
      this.createAndAppendMatch(publicMatchesContainer, match, {
        matchIsRunning: false,
        renderJoin: true,
      });
    }

    const tournamentGroups =
      transStore.matchmakingStore.getTournamentGroups();

    console.log("TOURNAMENT GROUPS");
    console.log(tournamentGroups);

    if (!tournamentGroups.playerIsPartOfATournament) {
      this.createAppendCreateTournamentBtn(tournamentContainer);
      for (const tournament of tournamentGroups.tournamentsToJoin) {
        this.createAndAppendTournament(tournamentContainer, tournament, {
          renderJoin: true,
          renderLeave: false,
        });
      }
    } else {
      this.createAndAppendTournament(
        tournamentContainer,
        tournamentGroups.tournamentsPlayerAlreadyJoined[0],
        {
          renderJoin: false,
          renderLeave: true,
        }
      );
    }
  }

  createAndAppendTournament(
    container: HTMLDivElement,
    tournament: MatchMakingTypes.Tournament,
    optns: OptnsTournamentItem
  ) {
    const elem = createHtmlElementFromString(
      `<tournament-item></tournament-item>`
    ) as TournamentItem;
    container.appendChild(elem);
    elem.setData(tournament, optns);
  }

  getCreateBtn(label: string) {
    return createHtmlElementFromString(`
      <button id="create-tournament-btn" class="w-full bg-green-600 hover:bg-green-700 py-2 rounded-lg">
                  ➕ ${label}
      </button>`) as HTMLButtonElement;
  }

  createAppendCreateTournamentBtn(container: HTMLDivElement) {
    const elem = this.getCreateBtn(
      transStore.languageStore.state.matchMaking.createTournament
    );
    container.appendChild(elem);

    elem.addEventListener("click", () =>
      MatchMakingInterface.sendMessageToServer({
        type: "createTournament",
        data: {
          playerId: transStore.userStore.get().details.id,
        },
      })
    );
  }

  createAppendCreateGameBtn(container: HTMLDivElement) {
    const elem = this.getCreateBtn(
      transStore.languageStore.state.matchMaking.createMatch
    );
    container.appendChild(elem);

    elem.addEventListener("click", () => {
      console.log("1111: Clicked create Game btn!");
      MatchMakingInterface.sendMessageToServer({
        type: "createGame",
        data: {
          matchId: generateUniqueId(),
          hostId: transStore.userStore.get().details.id,
          oponentId: null,
          invitedPlayerId: null,
          tournamentId: null,
          type: "public",
        },
      });
    });
  }

  createAppendDeleteGameBtn(container: HTMLDivElement) {
    const elem = createHtmlElementFromString(`
      <button id="close-match-btn" class="mt-3 bg-red-600 hover:bg-red-700 text-white py-1 px-3 rounded-lg">
                ❌ ${transStore.languageStore.state.matchMaking.closeMatchButton}
      </button>`) as HTMLButtonElement;
    container.appendChild(elem);

    elem.addEventListener("click", () => {
      if (isDefined(transStore.matchmakingStore.get().ownMatch)) {
        MatchMakingInterface.sendMessageToServer({
          type: "deleteGame",
          data: transStore.matchmakingStore.get()
            .ownMatch as MatchMakingTypes.BasicGame,
        });
      }
    });
  }

  createAndAppendMatch(
    container: HTMLDivElement,
    match: MatchMakingTypes.BasicGame,
    optns: OptnsMatchItem
  ) {
    const elem = createHtmlElementFromString(
      `<match-item></match-item>`
    ) as MatchItem;
    container.appendChild(elem);
    elem.setData(match, optns);
  }
}

customElements.define("match-making", MatchMaking);

export { MatchMaking };
