import { colog } from "transcendence";
import { GameServiceInterface } from "../../backendInterface/gameServiceInterface";
import { createHtmlElementFromString, navigateToSite } from "../../utils/utils";
import { CentralModalListeners } from "../CentralModalListeners";
import { MatchScore } from "./MatchScore";

class ManageMatch extends HTMLElement {
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
    if (window.store.gameStore.get().state === "running")
      this.leaveGame();
  }

  async render() {
    const gameState = window.store.gameStore.get().state;
    if (gameState === "none") navigateToSite("/");
    if (gameState === "matchmakingSuccessful") {
      window.store.gameStore.updateGameStateState("waitingForClientReady");
      await GameServiceInterface.createMatchOnServer({
        typeOfGame: window.store.gameStore.get().typeOfGame,
        matchId: window.store.gameStore.get().matchId,
        hostId: window.store.userStore.get().id,
        oponentId: window.store.oneVOneLocalStore.get().player2Name,
      });
    }
    if (gameState === "waitingForClientReady") {
      await GameServiceInterface.connect();
      this.renderWaitingClientStartModal();
    }
    if (gameState === "waitingForServerStart") {
      this.renderWaitingServerStartModal();
    }
    if (gameState === "running") {
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

  renderWaitingClientStartModal() {
    const modal = createHtmlElementFromString(`
      <central-modal-listeners>
        <p>Press 'y' when you are ready</p>
        <p>Press 'n' to cancel game</p>
      </central-modal-listeners>`) as CentralModalListeners;
    this.innerHTML = "";
    this.appendChild(modal);
    modal.open();
    modal.setKeyListener({
      KeyY: () => {
        window.store.gameStore.updateGameStateState("waitingForServerStart");
        GameServiceInterface.sendMessageToServer({
          type: "clientIsReady",
          data: {
            clientId: window.store.userStore.get().id,
            matchId: window.store.gameStore.get().matchId,
          },
        });
      },
      KeyN: this.leaveGame.bind(this),
    });

    // this.innerHTML = `
    //   <central-modal-listemers>
    //    <h2 class="text-xl font-bold">Confirm Action</h2>
    //    <p>Are you sure you want to proceed?</p>
    //  </central-modal>
    // `
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
