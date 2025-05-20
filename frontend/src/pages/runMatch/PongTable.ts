import { createHtmlElementFromString } from "../../utils/utils";
import { gameSettings } from "transcendence";
import { DrawPongTable } from "./drawPongTable";
import { PlayerMovementsUpdater } from "./updatePlayerMovements";

class PongTable extends HTMLElement {
  unsubscribeLanguage: null | (() => void);
  unsubscribeGameState: null | (() => void);
  canvas: HTMLCanvasElement;
  ctx: CanvasRenderingContext2D;
  animationFrameId: number;
  running: boolean;
  pressedKeys: Set<string>;
  pongTableDrawer: DrawPongTable;
  playerMovementsUpdater: PlayerMovementsUpdater;
  constructor() {
    super();
    this.unsubscribeLanguage = null;
    this.unsubscribeGameState = null;
    this.canvas = createHtmlElementFromString(`<canvas tabindex="0"></canvas>`) as HTMLCanvasElement;
    this.ctx = this.canvas.getContext("2d") as CanvasRenderingContext2D;
    this.animationFrameId = -1;
    this.running = true;
    this.pressedKeys = new Set();
    this.pongTableDrawer = new DrawPongTable(this.ctx);
    this.playerMovementsUpdater = new PlayerMovementsUpdater(this);
  }

  connectedCallback() {
    this.unsubscribeGameState = window.store.gameStore.subscribe(() =>
      this.render()
    );
    this.unsubscribeLanguage = window.store.gameStore.subscribe(() =>
      this.render()
    );
    this.designCanvas();
    this.startAnimationFrame();
    this.render();
    this.canvas.addEventListener("keydown", (event) => this.onKeyDown(event));
    this.canvas.addEventListener("keyup", (event) => this.onKeyUp(event));
  }

  disconnectedCallback() {
    if (this.unsubscribeGameState) this.unsubscribeGameState();
    if (this.unsubscribeLanguage) this.unsubscribeLanguage();
    this.canvas.removeEventListener("keydown", (event) => this.onKeyDown(event));
    this.canvas.removeEventListener("keyup", (event) => this.onKeyUp(event));
  }

  render() {
    this.canvas.focus();
    this.pongTableDrawer.draw();
  }

  startAnimationFrame() {
    const typeOfGame = window.store.gameStore.get().typeOfGame;
    switch (typeOfGame) {
      case "localPvP":
        requestAnimationFrame(() => {
          this.playerMovementsUpdater.updatePlayerMovementsLocalPvP();
        });
        break;
      case "localPvAi":
        requestAnimationFrame(() => {
          this.playerMovementsUpdater.updatePlayerMovementsLocalPvAi();
        });
        break;
      case "remote":
          if (this.playerHasLeftPaddle()) {
            requestAnimationFrame(() => {
              this.playerMovementsUpdater.updatePlayerMovementsRemote("paddleLeft");
            });
          } else {
            requestAnimationFrame(() => {
              this.playerMovementsUpdater.updatePlayerMovementsRemote(
                "paddleRight"
              );
            });
          }
        break;
    }
  }

  playerHasLeftPaddle() {
    return (
      window.store.gameStore.get().paddleLeft.playerId ===
      window.store.userStore.get().details.id
    );
  }

  designCanvas() {
    this.canvas.width = gameSettings.pongTableWidth;
    this.canvas.height = gameSettings.canvasHeight;
    const divWrapper = createHtmlElementFromString(`
      <div class="flex justify-center items-center"></div>
      `);
    divWrapper.appendChild(this.canvas);
    this.appendChild(divWrapper);
  }

  onKeyDown(event: KeyboardEvent) {
    event.preventDefault();
    // if (["w", "W", "s", "S", "ArrowUp", "ArrowDown"].includes(event.key)) {
    //   event.preventDefault();
    // }
    this.pressedKeys.add(event.key);
  }

  onKeyUp(event: KeyboardEvent) {
    event.preventDefault();
    // if (["w", "W", "s", "S", "ArrowUp", "ArrowDown"].includes(event.key)) {
    //   event.preventDefault();
    // }
    this.pressedKeys.delete(event.key);
  }
}

customElements.define("pong-table", PongTable);

export { PongTable };
