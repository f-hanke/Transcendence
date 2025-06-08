import { transStore } from "../state/store";
import { navigateToSite } from "../utils/utils";

class HomePage extends HTMLElement {
  unsubscribeLanguage: null | (() => void);

  constructor() {
    super();
    this.unsubscribeLanguage = null;
  }

  connectedCallback() {
    this.unsubscribeLanguage = transStore.languageStore.subscribe(
      this.render.bind(this)
    );
    this.render();
  }

  disconnectedCallback() {
    if (this.unsubscribeLanguage) this.unsubscribeLanguage();
  }

  render() {
    this.innerHTML = `
      <div class="min-h-screen bg-gray-900 text-white p-6">
        <div class="max-w-6xl mx-auto">
          <!-- Welcome Header -->
          <div class="text-center mb-12">
            <h1 class="text-4xl font-bold mb-4">🏓 ${
              transStore.languageStore.state.navbar.play
            }</h1>
          </div>

          <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        
            <div class="bg-gray-800 rounded-xl p-6 hover:bg-gray-700 transition-all duration-300 cursor-pointer transform hover:scale-105 border border-gray-700" id="localGameCard">
              <div class="text-center">
                <div class="text-5xl mb-4">👥</div>
                <h3 class="text-xl font-semibold mb-2">${
                  transStore.languageStore.state.navbar.oneV1local
                }</h3>
              </div>
            </div>

            <div class="bg-gray-800 rounded-xl p-6 hover:bg-gray-700 transition-all duration-300 cursor-pointer transform hover:scale-105 border border-gray-700" id="remoteGameCard">
              <div class="text-center">
                <div class="text-5xl mb-4">🌐</div>
                <h3 class="text-xl font-semibold mb-2">${
                  transStore.languageStore.state.navbar.oneV1remote
                }</h3>
              </div>
            </div>

            <div class="bg-gray-800 rounded-xl p-6 hover:bg-gray-700 transition-all duration-300 cursor-pointer transform hover:scale-105 border border-gray-700" id="tournamentCard">
              <div class="text-center">
                <div class="text-5xl mb-4">🏆</div>
                <h3 class="text-xl font-semibold mb-2">${
                  transStore.languageStore.state.navbar.tournament
                }</h3>
              </div>
            </div>

            <div class="bg-gray-800 rounded-xl p-6 hover:bg-gray-700 transition-all duration-300 cursor-pointer transform hover:scale-105 border border-gray-700" id="chatCard">
              <div class="text-center">
                <div class="text-5xl mb-4">💬</div>
                <h3 class="text-xl font-semibold mb-2">${
                  transStore.languageStore.state.navbar.messages
                }</h3>
              </div>
            </div>

          </div>

          <div class="mt-12 bg-gray-800 rounded-xl p-6 border border-gray-700">
            <div class="flex items-center justify-between">
              <div class="flex items-center gap-4">
                <div class="text-3xl">⚡</div>
                <div>
                  <p class="text-gray-400">${
                    transStore.userStore.get().details.displayName
                  }</p>
                </div>
              </div>
              <div class="text-right">
                <div class="text-2xl font-bold text-green-400">●</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    `;

    // Add click handlers for navigation
    const localGameCard = this.querySelector("#localGameCard");
    const remoteGameCard = this.querySelector("#remoteGameCard");
    const tournamentCard = this.querySelector("#tournamentCard");
    const chatCard = this.querySelector("#chatCard");

    if (localGameCard) {
      localGameCard.addEventListener("click", () => {
        navigateToSite("oneVOneLocal");
      });
    }

    if (remoteGameCard) {
      remoteGameCard.addEventListener("click", () => {
        navigateToSite("matchmaking");
      });
    }

    if (tournamentCard) {
      tournamentCard.addEventListener("click", () => {
        navigateToSite("currentTournament");
      });
    }

    if (chatCard) {
      chatCard.addEventListener("click", () => {
        navigateToSite("chat");
      });
    }
  }
}

customElements.define("home-page", HomePage);

export { HomePage };
