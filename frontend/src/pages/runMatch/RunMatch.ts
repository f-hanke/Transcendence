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

  render() {
    const gameState = window.store.gameStore.get().state;
    this.renderRunningGame();
    if (gameState === "none") navigateToSite("/");
    // if (gameState === "running") {
    //  this.renderRunningGame();
    // }
  }

  renderRunningGame()
  {
    this.matchScoreComponent = createHtmlElementFromString(
      "<match-score></match-score>"
    ) as MatchScore;
    const pongTableComponent = createHtmlElementFromString(
      "<pong-table></pong-table>"
    );
    const wrapper = createHtmlElementFromString(
      "<div class='bg-black h-full w-full text-white'><div>"
    );
    wrapper.appendChild(pongTableComponent);
    wrapper.appendChild(this.matchScoreComponent);
    this.appendChild(wrapper);
  }
}

customElements.define("run-match", RunMatch);

export { RunMatch };
