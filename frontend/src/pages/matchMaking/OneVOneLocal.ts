import { generateUniqueId } from "transcendence";
import { navigateToSite } from "../../utils/utils";
import { transStore } from "../../state/store";

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
    transStore.gameStore.updateMatchId(generateUniqueId());
    this.addEventListener("playerChangedTypeOfLocalGame", () => {
      this.typeOfGameChange();
    });
    this.render();
    this.unsubscribe = transStore.oneVOneLocalStore.subscribe(
      this.render.bind(this)
    );
    this.unsubscribeGameState = transStore.gameStore.subscribe(
      this.render.bind(this)
    );
    this.unsubscribeLanguage = transStore.languageStore.subscribe(
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
    if (transStore.gameStore.get().state === "matchmakingSuccessful")
      navigateToSite("manageMatch");
    this.innerHTML = `
      <div class="w-full h-full flex flex-col items-center justify-center bg-gray-900 text-white p-6 rounded-lg shadow-lg">
        <h2 class="text-2xl font-bold mb-4">${
          transStore.languageStore.state.oneVOneLocal.localGameOnSame
        }</h2>

        <div class="w-full max-w-sm">
          <div class="mb-4">
            <label class="block text-sm font-medium text-gray-300">${
              transStore.languageStore.state.oneVOneLocal.player1
            }</label>
            <input type="text" value="${
              transStore.userStore.get().details.displayName
            }" disabled
              class="w-full px-4 py-2 mt-1 bg-gray-700 text-white rounded-md">
          </div>

          <toggle-ai-button></toggle-ai-button>
          <div class="mb-4">
            <label class="block text-sm font-medium text-gray-300">${
              transStore.languageStore.state.oneVOneLocal.player2
            }</label>
            <input type="text" id="playerTwoInput" value="${
              transStore.oneVOneLocalStore.get().player2Name
            }" placeholder="${
  transStore.languageStore.state.oneVOneLocal.enterPlayer2NamePlaceholder
}" 
              class="w-full px-4 py-2 mt-1 bg-gray-700 text-white rounded-md border border-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500">
          </div>
          <button id="startGameBtn"
            class="w-full text-white font-semibold py-2 rounded-md shadow-md transition ${
              transStore.oneVOneLocalStore.get().player2Name === ""
                ? "bg-gray-600 cursor-not-allowed opacity-50"
                : "bg-green-600 hover:bg-green-700"
            }" ${
              transStore.oneVOneLocalStore.get().player2Name === ""
                ? "disabled"
                : ""
            }>
            ${transStore.languageStore.state.oneVOneLocal.startGame}
          </button>
        </div>
      </div>
    `;
    document
      .querySelector("#startGameBtn")
      ?.addEventListener("click", (event) => {
        event.stopPropagation();
        this.setGameState();
        transStore.gameStore.updateGameStateState("matchmakingSuccessful");
      });

    const playerTwoInput = this.querySelector(
      "#playerTwoInput"
    ) as HTMLInputElement;
    let debounceTimeout: number | null = null;

    playerTwoInput.addEventListener("input", () => {
      if (debounceTimeout) clearTimeout(debounceTimeout);
      debounceTimeout = window.setTimeout(() => {
        transStore.oneVOneLocalStore.updatePlayer2Name(
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

  setGameState() {
    const idSecondPlayer = transStore.gameStore.get().typeOfGame === "localPvAi" ? `AI_${transStore.oneVOneLocalStore.get().player2Name}` : `Human_${transStore.oneVOneLocalStore.get().player2Name}`;
      transStore.gameStore.updateMatchMakingSuccessful({
        hostId: transStore.userStore.get().details.id,
        oponentId: idSecondPlayer,
        selfHosted: true,
        playerLeftPaddleId:  transStore.userStore.get().details.id,
        playerRightPaddleId: idSecondPlayer,
      });
  }

  typeOfGameChange() {
    if (transStore.gameStore.get().typeOfGame === "localPvAi")
      transStore.gameStore.updateGameStateTypeOfGame("localPvP");
    else transStore.gameStore.updateGameStateTypeOfGame("localPvAi");
  }
}

customElements.define("onevone-local", OneVOneLocal);

export { OneVOneLocal };
