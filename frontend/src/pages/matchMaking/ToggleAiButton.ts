
class ToggleAiButton extends HTMLElement {
  private button: HTMLButtonElement;
  unsubscribeLanguage: null | (() => void);
  unsubscribeGameState: null | (() => void);
  constructor() {
    super();
    this.button = document.createElement("button");
    this.button.className =
      "px-4 py-2 bg-blue-500 text-white rounded-lg shadow-md hover:bg-blue-600 transition w-full mb-3";
    this.button.textContent = this.getCurrentBtnText();

    this.button.addEventListener("click", () => this.toggleOpponent());
    this.appendChild(this.button);
    this.unsubscribeLanguage = null;
    this.unsubscribeGameState = null;
  }

  connectedCallback() {
    this.unsubscribeLanguage = window.store.languageStore.subscribe(
      this.render.bind(this)
    );
    this.unsubscribeGameState = window.store.gameStore.subscribe(
      this.render.bind(this)
    );
  }

  disconnectedCallback() {
    if (this.unsubscribeLanguage) this.unsubscribeLanguage();
    if (this.unsubscribeGameState) this.unsubscribeGameState();
  }

  render() {
    this.button.textContent = this.getCurrentBtnText();
  }

  getCurrentBtnText() {
    if (window.store.gameStore.get().typeOfGame === "localPvAi")
      return window.store.languageStore.state.oneVOneLocal.aIOrHumanBtnAi;
    return window.store.languageStore.state.oneVOneLocal.aIOrHumanBtnHuman;
  }

  toggleOpponent() {
    this.dispatchEvent(
      new CustomEvent("playerChangedTypeOfLocalGame", {
        bubbles: true,
      })
    );
  }
}

customElements.define("toggle-ai-button", ToggleAiButton);
