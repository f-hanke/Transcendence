import { createHtmlElementFromString, navigateToSite } from "../../utils/utils";
import { MatchScore } from "./MatchScore";

class RunMatch extends HTMLElement {
  unsubscribeLanguage: null | (() => void);
  unsubscribeGameState: null | (() => void);
  matchScoreComponent: MatchScore | null;
  constructor() {
    super();
    this.unsubscribeLanguage = null;
    this.unsubscribeGameState = null;
    this.matchScoreComponent = null;
  }

  connectedCallback() {
    this.unsubscribeGameState = window.store.gameStore.subscribe(
      this.update.bind(this)
    );
    this.unsubscribeLanguage = window.store.languageStore.subscribe(() =>
      this.render()
    );
    this.render();
  }

  disconnectedCallback() {
    if (this.unsubscribeLanguage) this.unsubscribeLanguage();
    if (this.unsubscribeGameState) this.unsubscribeGameState();
  }

  update() {
    if (window.store.gameStore.get().state === "none") navigateToSite("/");
    if (this.matchScoreComponent) this.matchScoreComponent.update();
  }

  async render() {
    const gameState = window.store.gameStore.get().state;
    if (gameState === "none") {
      navigateToSite("/");
    }
    this.renderRunningGame();
  }

  renderRunningGame() {
    this.innerHTML = "";
    this.matchScoreComponent = createHtmlElementFromString(
      "<match-score></match-score>"
    ) as MatchScore;
    const pongTableComponent = createHtmlElementFromString(
      "<pong-table></pong-table>"
    );
    const wrapper = createHtmlElementFromString(
      "<div class='bg-black flex flex-col justify-center h-full w-full text-white'><div>"
    );
    wrapper.appendChild(this.matchScoreComponent);
    wrapper.appendChild(pongTableComponent);
    this.appendChild(wrapper);
  }
}

customElements.define("run-match", RunMatch);

export { RunMatch };
