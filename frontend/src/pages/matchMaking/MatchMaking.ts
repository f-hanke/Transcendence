import { generateUniqueId, isDefined, MatchMakingTypes } from "transcendence";
import { MatchMakingInterface } from "../../backendInterface/matchmakingInterface";
import { createHtmlElementFromString, navigateToSite } from "../../utils/utils";
import { MatchItem, OptnsMatchItem } from "./MatchItem";

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
    this.unsubscribeMatchmakingState = window.store.matchmakingStore.subscribe(
      this.render.bind(this)
    );
    this.unsubscribeGameState = window.store.gameStore.subscribe(
      this.render.bind(this)
    );
    this.unsubscribeLanguage = window.store.languageStore.subscribe(() =>
      this.render()
    );
    MatchMakingInterface.connect();
  }

  disconnectedCallback() {
    if (this.unsubscribeMatchmakingState) this.unsubscribeMatchmakingState();
    if (this.unsubscribeGameState) this.unsubscribeGameState();
    if (this.unsubscribeLanguage) this.unsubscribeLanguage();
    MatchMakingInterface.disconnect();
  }

  render() {
    const containerStyle = `mb-6 p-4 bg-gray-700 rounded-lg`;
    const ownMatch = window.store.matchmakingStore.get().ownMatch;
    const ownMatchOpen = isDefined(ownMatch);
    if (window.store.gameStore.get().state === "matchmakingSuccessful")
      navigateToSite("manageMatch");
    this.innerHTML = `
      <div class="p-4 w-full h-full mx-auto bg-gray-800 text-white rounded-lg shadow-lg">
        <h2 class="text-xl font-semibold mb-4">${
          window.store.languageStore.state.matchMaking.matchMaking
        }</h2>
        <!-- Create a Match -->
        <div id="containerOwnMatch" class="${containerStyle}">
          <h3 class="text-lg font-medium mb-2">${
            window.store.languageStore.state.matchMaking.yourOwnMatchHeading
          }</h3>
        </div>

        <!-- List of Other Matches -->
        <div id="containerPrivateMatches" class="${containerStyle}">
          <h3 class="text-lg font-medium mb-2">${
            window.store.languageStore.state.matchMaking.privateMatches
          }</h3>
        </div>
        <div id="containerPublicMatches" class="${containerStyle}">
          <h3 class="text-lg font-medium mb-2">${
            window.store.languageStore.state.matchMaking.publicMatches
          }</h3>
        </div>
        <div id="containerTournamentMatches" class="${containerStyle}">
          <h3 class="text-lg font-medium mb-2">${
            window.store.languageStore.state.matchMaking.tournamentMatches
          }</h3>
        </div>
      </div>
    `;
    
    const matchGroups = window.store.matchmakingStore.getMatchGroups();

    const ownMatchContainer = document.querySelector(
      "#containerOwnMatch"
    ) as HTMLDivElement;
    const publicMatchesContainer = document.querySelector(
      "#containerPublicMatches"
    ) as HTMLDivElement;
    const privateMatchesContainer = document.querySelector(
      "#containerPrivateMatches"
    ) as HTMLDivElement;
    const tournamentMatchesContainer = document.querySelector(
      "#containerTournamentMatches"
    ) as HTMLDivElement;

    if (ownMatchOpen) {
      this.createAndAppend(ownMatchContainer, ownMatch,  { matchIsRunning: false, renderJoin: false });
      this.createAppendDeleteGameBtn(ownMatchContainer);
    } else {
      this.createAppendCreateGameBtn(ownMatchContainer);
    }

    for (const match of matchGroups.private) {
      this.createAndAppend(privateMatchesContainer, match,  { matchIsRunning: false, renderJoin: true });
    }
    for (const match of matchGroups.public) {
      this.createAndAppend(publicMatchesContainer, match,  { matchIsRunning: false, renderJoin: true });
    }
    for (const match of matchGroups.tournament) {
      this.createAndAppend(tournamentMatchesContainer, match,  { matchIsRunning: false, renderJoin: true });
    }
  }

  createAppendCreateGameBtn(container: HTMLDivElement) {
    const elem = createHtmlElementFromString(`
      <button id="create-match-btn" class="w-full bg-green-600 hover:bg-green-700 py-2 rounded-lg">
                  ➕ ${window.store.languageStore.state.matchMaking.createMatch}
      </button>`) as HTMLButtonElement;
    container.appendChild(elem);

    elem.addEventListener("click", () =>
      MatchMakingInterface.sendMessageToServer({
        type: "createGame",
        data: {
          matchId: generateUniqueId(),
          hostId: window.store.userStore.get().id,
          oponentId: null,
          invitedPlayerId: null,
          tournamentId: null,
          type: "public",
        },
      })
    );

  }

  createAppendDeleteGameBtn(container: HTMLDivElement) {
    const elem = createHtmlElementFromString(`
      <button id="close-match-btn" class="mt-3 bg-red-600 hover:bg-red-700 text-white py-1 px-3 rounded-lg">
                ❌ ${window.store.languageStore.state.matchMaking.closeMatchButton}
      </button>`) as HTMLButtonElement;
    container.appendChild(elem);

    elem.addEventListener("click", () => {
        if (isDefined(window.store.matchmakingStore.get().ownMatch)) {
          MatchMakingInterface.sendMessageToServer({
            type: "deleteGame",
            data: window.store.matchmakingStore.get()
              .ownMatch as MatchMakingTypes.BasicGame,
          });
        }
      });

  }

  createAndAppend(
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
