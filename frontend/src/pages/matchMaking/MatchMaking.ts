import { generateUniqueId, isDefined, MatchMakingTypes } from "transcendence";
import { MatchMakingInterface } from "../../backendInterface/matchmakingInterface";
import { navigateToSite } from "../../utils/utils";

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
    const ownMatch = window.store.matchmakingStore.get().ownMatch;
    const ownMatchOpen = isDefined(ownMatch);
    if(window.store.gameStore.get().state === "matchmakingSuccessful")
      navigateToSite("runMatch");
    this.innerHTML = `
      <div class="p-4 w-full h-full mx-auto bg-gray-800 text-white rounded-lg shadow-lg">
        <h2 class="text-xl font-semibold mb-4">${
          window.store.languageStore.state.matchMaking.matchMaking
        }</h2>
        <!-- Create a Match -->
        <div class="mb-6 p-4 bg-gray-700 rounded-lg">
          <h3 class="text-lg font-medium mb-2">${
            window.store.languageStore.state.matchMaking.yourOwnMatchHeading
          }</h3>
          ${
            ownMatchOpen
              ? `<match-item 
              matchId="${ownMatch.matchId}"
              hostId="${ownMatch.hostId}"
              hostName="${ownMatch.hostId}"
              oponentId="${
                ownMatch.oponentId ? ownMatch.oponentId : "Waiting for oponent!"
              }"
              oponentName="${
                ownMatch.oponentId ? ownMatch.oponentId : "Waiting for oponent!"
              }"
              matchIsRunning="0"
              renderJoin="0">
            </match-item>
            <button id="close-match-btn" class="mt-3 bg-red-600 hover:bg-red-700 text-white py-1 px-3 rounded-lg">
                ❌ ${
                  window.store.languageStore.state.matchMaking.closeMatchButton
                }
            </button>
            `
              : // `<div>
                //     <p class="font-semibold">${window.store.languageStore.state.matchMaking.yourMatch}</p>

                //   </div>`
                `<button id="create-match-btn" class="w-full bg-green-600 hover:bg-green-700 py-2 rounded-lg">
                  ➕ ${window.store.languageStore.state.matchMaking.createMatch}
                </button>`
          }
        </div>

        <!-- List of Other Matches -->
        <div class="bg-gray-700 p-4 rounded-lg">
          <h3 class="text-lg font-medium mb-2">${
            window.store.languageStore.state.matchMaking.availableMatches
          }</h3>
          ${
            window.store.matchmakingStore.get().otherMatches.length > 0
              ? `<ul class="space-y-2">
                ${window.store.matchmakingStore
                  .get()
                  .otherMatches.map(
                    (match) => `
                  <li>
                     <match-item 
                        matchId="${match.matchId}"
                        hostId="${match.hostId}"
                        hostName="${match.hostId}"
                        oponentId="${
                          match.oponentId ? match.oponentId : "Could be you!"
                        }"
                        oponentName="${
                          match.oponentId ? match.oponentId : "Could be you!"
                        }"
                        matchIsRunning=${match.oponentId ? "1" : "0"}
                        renderJoin=${
                          ownMatchOpen || match.oponentId ? "0" : "1"
                        }>
                      </match-item>
                  </li>`
                  )
                  .join("")}
              </ul>`
              : `<p class="text-gray-300">${window.store.languageStore.state.matchMaking.noMatchesAvailable}</p>`
          }
        </div>
      </div>
    `;
    document.querySelector("#create-match-btn")?.addEventListener("click", () =>
      MatchMakingInterface.sendMessageToServer({
        type: "createGame",
        data: {
          matchId: generateUniqueId(),
          hostId: window.store.userStore.get().id,
          oponentId: null,
        },
      })
    );

    document
      .querySelector("#close-match-btn")
      ?.addEventListener("click", () => {
        if (isDefined(window.store.matchmakingStore.get().ownMatch)) {
          MatchMakingInterface.sendMessageToServer({
            type: "deleteGame",
            data: window.store.matchmakingStore.get()
              .ownMatch as MatchMakingTypes.BasicGame,
          });
        }
      });
  }
}

customElements.define("match-making", MatchMaking);

export { MatchMaking };
