import { GameServiceInterface } from "../../backendInterface/gameServiceInterface";
import { createHtmlElementFromString, navigateToSite } from "../../utils/utils";
import { CentralModalListeners } from "../CentralModalListeners";
import { MatchScore } from "./MatchScore";
import { transStore } from "../../state/store";

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
    this.unsubscribeGameState = transStore.gameStore.subscribe(
      this.render.bind(this)
    );
    this.unsubscribeLanguage = transStore.languageStore.subscribe(
      this.render.bind(this)
    );
    this.render();
  }

  disconnectedCallback() {
    // colog("DISCONNECTED cALLBACK cALLEd");

    if (this.unsubscribeLanguage) this.unsubscribeLanguage();
    if (this.unsubscribeGameState) this.unsubscribeGameState();
    if (transStore.gameStore.get().state === "running") this.leaveGame();
    if (!(["matchmakingSuccessful", "waitingForClientReady"].includes(transStore.gameStore.get().state)))
    {
      // colog("reset");
      // colog(transStore.gameStore.get().state);
      transStore.gameStore.reset();
    }
  }

  async render() {
    // colog("in manage match");
    // colog(transStore.gameStore.get().state);
    if (transStore.gameStore.get().state === "none") navigateToSite("/");
    if (transStore.gameStore.get().state === "matchmakingSuccessful") {
      transStore.gameStore.updateGameStateState(
        "waitingForClientReady",
        false
      );
      if (transStore.gameStore.get().selfHosted) {
        await GameServiceInterface.createMatchOnServer({
          typeOfGame: transStore.gameStore.get().typeOfGame,
          matchId: transStore.gameStore.get().matchId,
          hostId: transStore.gameStore.get().hostId,
          oponentId: transStore.gameStore.get().oponentId,
        });
      }
    }
    if (transStore.gameStore.get().state === "waitingForClientReady") {
      await GameServiceInterface.connect();
      this.renderWaitingClientStartModal();
    }
    if (transStore.gameStore.get().state === "waitingForServerStart") {
      setTimeout(() => this.renderWaitingServerStartModal(), 0);
    }
    if (transStore.gameStore.get().state === "running") {
      if (this.unsubscribeGameState) this.unsubscribeGameState();
      this.renderRunningGame();
    }
  }

  renderWaitingServerStartModal() {
    console.log("RENDERING WAITING FOR SERVER START MODAL");
    const t = transStore.languageStore.state.manageMatch;

    transStore.modalStore.updateAddKeyDownCallback(
      "KeyN",
      this.leaveGame.bind(this)
    );
    transStore.modalStore.updateSetContent([
      t.waitingServerStart,
      t.cancelKeyInstruction,
    ]);
    transStore.modalStore.updateSetOpen();
    // this.innerHTML = "";
    const modal = createHtmlElementFromString(`
      <central-modal-listeners></central-modal-listeners>`) as CentralModalListeners;
    this.appendChild(modal);
  }

  async renderWaitingClientStartModal() {
    const t = transStore.languageStore.state.manageMatch;
    transStore.modalStore.updateAddKeyDownCallback("KeyY", () => {
      transStore.gameStore.updateGameStateState("waitingForServerStart");
      GameServiceInterface.sendMessageToServer({
        type: "clientIsReady",
        data: {
          clientId: transStore.userStore.get().details.id,
          matchId: transStore.gameStore.get().matchId,
        },
      });
    });
    transStore.modalStore.updateAddKeyDownCallback(
      "KeyN",
      this.leaveGame.bind(this)
    );
    transStore.modalStore.updateSetContent([
      t.readyKeyInstruction,
      t.cancelKeyInstruction,
    ]);
    transStore.modalStore.updateSetOpen();
    const modal = createHtmlElementFromString(`
      <central-modal-listeners></central-modal-listeners>`) as CentralModalListeners;
    // this.innerHTML = "";
    this.appendChild(modal);
  }

  renderRunningGame() {
    this.innerHTML = `
      <run-match><run-match>
    `;
  }

  leaveGame() {
    GameServiceInterface.disconnect(true);
  }
}

customElements.define("manage-match", ManageMatch);

export { ManageMatch };
