import { GameServiceInterface } from "../../backendInterface/gameServiceInterface";
import { createHtmlElementFromString, navigateToSite } from "../../utils/utils";
import { CentralModalListeners } from "../CentralModalListeners";
import { MatchScore } from "./MatchScore";

class ManageMatch extends HTMLElement {
  unsubscribeLanguage: null | (() => void);
  unsubscribeGameState: null | (() => void);
  matchScoreComponent: MatchScore | null;
  modal?: CentralModalListeners;
  constructor() {
    super();
    this.unsubscribeLanguage = null;
    this.unsubscribeGameState = null;
    this.matchScoreComponent = null;
  }

  connectedCallback() {
    this.unsubscribeGameState = window.store.gameStore.subscribe(
      this.render.bind(this)
    );
    this.unsubscribeLanguage = window.store.languageStore.subscribe(
      this.render.bind(this)
    );
    this.render();
  }

  disconnectedCallback() {
    if (this.unsubscribeLanguage) this.unsubscribeLanguage();
    if (this.unsubscribeGameState) this.unsubscribeGameState();
    if (window.store.gameStore.get().state === "running") this.leaveGame();
    window.store.gameStore.reset();
  }

  async render() {
    if (window.store.gameStore.get().state === "none") navigateToSite("/");
    if (window.store.gameStore.get().state === "matchmakingSuccessful") {
      window.store.gameStore.updateGameStateState(
        "waitingForClientReady",
        false
      );
      if (window.store.gameStore.get().selfHosted) {
        await GameServiceInterface.createMatchOnServer({
          typeOfGame: window.store.gameStore.get().typeOfGame,
          matchId: window.store.gameStore.get().matchId,
          hostId: window.store.gameStore.get().hostId,
          oponentId: window.store.gameStore.get().oponentId,
        });
      }
    }
    if (window.store.gameStore.get().state === "waitingForClientReady") {
      await GameServiceInterface.connect();
      this.renderWaitingClientStartModal();
    }
    if (window.store.gameStore.get().state === "waitingForServerStart") {
      this.renderWaitingServerStartModal();
    }
    if (window.store.gameStore.get().state === "running") {
      if (this.unsubscribeGameState) this.unsubscribeGameState();
      this.renderRunningGame();
    }
  }

  renderWaitingServerStartModal() {
    const modal = createHtmlElementFromString(`
      <central-modal-listeners>
        <p>Waiting for Server to start game</p>
        <p>Press 'n' to cancel game</p>
      </central-modal-listeners>`) as CentralModalListeners;
    this.innerHTML = "";
    this.appendChild(modal);
    modal.open();
    modal.setKeyListener({
      KeyN: this.leaveGame.bind(this),
    });
  }

  async renderWaitingClientStartModal() {
    const modal = createHtmlElementFromString(`
      <central-modal-listeners>
        <p>Press 'y' when you are ready</p>
        <p>Press 'n' to cancel game</p>
      </central-modal-listeners>`) as CentralModalListeners;
      this.innerHTML = "";
      this.appendChild(modal);
      modal.ready.then(() => {
        modal.open();
        modal.setKeyListener({
          KeyY: () => {
            window.store.gameStore.updateGameStateState("waitingForServerStart");
            GameServiceInterface.sendMessageToServer({
              type: "clientIsReady",
              data: {
                clientId: window.store.userStore.get().details.id,
                matchId: window.store.gameStore.get().matchId,
              },
            });
          },
          KeyN: this.leaveGame.bind(this),
        });
      })
  }

  renderRunningGame() {
    this.innerHTML = `
      <run-match><run-match>
    `;
  }

  leaveGame() {
    GameServiceInterface.disconnect();
    window.store.gameStore.updateGameStateState("none");
  }
}

customElements.define("manage-match", ManageMatch);

export { ManageMatch };
