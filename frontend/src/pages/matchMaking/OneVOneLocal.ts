import { colog, generateUniqueId } from "transcendence";
import { navigateToSite } from "../../utils/utils";

class OneVOneLocal extends HTMLElement {
  unsubscribe: null | (() => void);
  unsubscribeGameState: null | (() => void);
  unsubscribeLanguage: null | (() => void);
  constructor() {
    super();
    this.unsubscribe = null;
    this.unsubscribeLanguage = null;
    this.unsubscribeGameState = null;
  }

  connectedCallback() {
    this.addEventListener("playerChangedTypeOfLocalGame", () => {
      this.typeOfGameChange();
    });
    this.render();
    this.unsubscribe = window.store.oneVOneLocalStore.subscribe(
      this.render.bind(this)
    );
    this.unsubscribeGameState = window.store.gameStore.subscribe(
      this.render.bind(this)
    );
    this.unsubscribeLanguage = window.store.languageStore.subscribe(
      this.render.bind(this)
    );
  }

  disconnectedCallback() {
    if (this.unsubscribe) this.unsubscribe();
    if (this.unsubscribeLanguage) this.unsubscribeLanguage();
    if (this.unsubscribeGameState) this.unsubscribeGameState();
    this.removeEventListener("playerChangedTypeOfLocalGame", () => {
      this.typeOfGameChange();
    });
  }

  render() {
    if (window.store.gameStore.get().state === "matchmakingSuccessful")
      navigateToSite("runMatch");
    this.innerHTML = `
      <div class="w-full h-full flex flex-col items-center justify-center bg-gray-900 text-white p-6 rounded-lg shadow-lg">
        <h2 class="text-2xl font-bold mb-4">${
          window.store.languageStore.state.oneVOneLocal.localGameOnSame
        }</h2>

        <div class="w-full max-w-sm">
          <div class="mb-4">
            <label class="block text-sm font-medium text-gray-300">${
              window.store.languageStore.state.oneVOneLocal.player1
            }</label>
            <input type="text" value="${
              window.store.userStore.get().displayName
            }" disabled
              class="w-full px-4 py-2 mt-1 bg-gray-700 text-white rounded-md">
          </div>

          <toggle-ai-button></toggle-ai-button>
          <div class="mb-4">
            <label class="block text-sm font-medium text-gray-300">${
              window.store.languageStore.state.oneVOneLocal.player2
            }</label>
            <input type="text" id="playerTwoInput" value="${
              window.store.oneVOneLocalStore.get().player2Name
            }" placeholder="Enter Player 2 Name"
              class="w-full px-4 py-2 mt-1 bg-gray-700 text-white rounded-md border border-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500">
          </div>
          <button id="startGameBtn"
            class="w-full bg-green-600 text-white font-semibold py-2 rounded-md shadow-md hover:bg-green-700 transition ${
              window.store.oneVOneLocalStore.get().player2Name === ""
                ? "hidden"
                : ""
            }">
            ${window.store.languageStore.state.oneVOneLocal.startGame}
          </button>
        </div>
      </div>
    `;
    document
      .querySelector("#startGameBtn")
      ?.addEventListener("click", (event) => {
        this.assignPaddles();
        window.store.gameStore.updateGameStateState("matchmakingSuccessful");
      });

    const playerTwoInput = this.querySelector(
      "#playerTwoInput"
    ) as HTMLInputElement;
    let debounceTimeout: number | null = null;

    playerTwoInput.addEventListener("input", (event) => {
      if (debounceTimeout) clearTimeout(debounceTimeout);
      debounceTimeout = window.setTimeout(() => {
        window.store.oneVOneLocalStore.updatePlayer2Name(
          playerTwoInput.value.trim()
        );
      }, 500);
    });
    playerTwoInput.addEventListener("focus", () => {
      const length = playerTwoInput.value.length;
      playerTwoInput.setSelectionRange(length, length);
    });
    playerTwoInput.focus();
  }

  assignPaddles() {
    if (window.store.gameStore.get().typeOfGame === "localPvAi") {
      window.store.gameStore.updateAssignPaddles(
        window.store.userStore.get().id,
        "idAi"
      );
    } else 
    {
      window.store.gameStore.updateAssignPaddles(
        window.store.userStore.get().id,
        "idTempHuman"
      );
    }
  }

  typeOfGameChange() {
    if (window.store.gameStore.get().typeOfGame === "localPvAi")
      window.store.gameStore.updateGameStateTypeOfGame("localPvP");
    else window.store.gameStore.updateGameStateTypeOfGame("localPvAi");
  }
}

customElements.define("onevone-local", OneVOneLocal);

export { OneVOneLocal };
