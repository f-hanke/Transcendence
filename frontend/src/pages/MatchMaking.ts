import { generateUniqueId } from "../utils/utils";

class MatchMaking extends HTMLElement {
  unsubscribe: null | (() => void);
  unsubscribeLanguage: null | (() => void);
  constructor() {
    super();
    this.unsubscribe = null;
    this.unsubscribeLanguage = null;
  }

  connectedCallback() {
    this.render();
    this.unsubscribe = window.store.matchmakingStore.subscribe(
      this.render.bind(this)
    );
    this.unsubscribeLanguage = window.store.languageStore.subscribe(() =>
      this.render()
    );
    console.log("HERE!");
    console.log(window.store.matchmakingStore);
  }

  disconnectedCallback() {
    if (this.unsubscribe) this.unsubscribe();
    if (this.unsubscribeLanguage) this.unsubscribeLanguage();
  }

  render() {
    this.innerHTML = `
      <div class="p-4 w-full h-full mx-auto bg-gray-800 text-white rounded-lg shadow-lg">
        <h2 class="text-xl font-semibold mb-4">${
          window.store.languageStore.state.matchMaking.matchMaking
        }</h2>
        <!-- Create a Match -->
        <div class="mb-6 p-4 bg-gray-700 rounded-lg">
          ${
            window.store.matchmakingStore.get().ownMatchId
              ? `<div>
                  <p class="font-semibold">${window.store.languageStore.state.matchMaking.yourMatch}</p>
                  <button id="close-match-btn" class="mt-3 bg-red-600 hover:bg-red-700 text-white py-1 px-3 rounded-lg">
                    ❌ Close Match
                  </button>
                </div>`
              : `<button id="create-match-btn" class="w-full bg-green-600 hover:bg-green-700 py-2 rounded-lg">
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
                  <li class="flex justify-between items-center bg-gray-600 p-2 rounded-lg">
                    <span class="font-medium">${match.hostNickName}'s ${window.store.languageStore.state.matchMaking.match}</span>
                    <button class="join-match-btn bg-blue-500 hover:bg-blue-600 py-1 px-3 rounded-lg" data-match-id="${match.matchId}">
                      ▶ ${window.store.languageStore.state.matchMaking.join}
                    </button>
                  </li>`
                  )
                  .join("")}
              </ul>`
              : `<p class="text-gray-300">No matches available...</p>`
          }
        </div>
      </div>
    `;
    document
      .querySelector("#create-match-btn")
      ?.addEventListener("click", (event) =>
        window.store.matchmakingStore.openOwnMatch()
      );
    document
      .querySelector("#close-match-btn")
      ?.addEventListener("click", (event) =>
        window.store.matchmakingStore.closeOwnMatch()
      );
  }
}

customElements.define("match-making", MatchMaking);

export { MatchMaking };
