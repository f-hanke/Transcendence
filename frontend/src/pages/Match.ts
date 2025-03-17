import { updateBallPosition } from "../ test";
import { GameState } from "../state/types";
import { createHtmlElementFromString } from "../utils/utils";

class MatchPage extends HTMLElement {
  unsubscribe: null | (() => void);
  canvas: HTMLCanvasElement;
  ctx: CanvasRenderingContext2D | null;
  animationFrameId: number;
  running: boolean;
  pressedKeys: Set<string>;
  websocket: WebSocket | null;
  constructor() {
    super();
    this.unsubscribe = null;
    this.websocket = null;
    this.canvas = document.createElement("canvas");
    this.ctx = this.canvas.getContext("2d");
    this.animationFrameId = -1;
    this.running = true;
    this.update = this.update.bind(this);
    this.pressedKeys = new Set();
    console.log("Hello World1!");
  }

  connectedCallback() {
    console.log("Hello World!");
    this.unsubscribe = window.store.subscribe("gameState", () => this.update());
    this.designCanvas();
    // // requestAnimationFrame(this.update);
    // // this.update();

    // this.websocket = new WebSocket("ws://localhost:8080");
    this.websocket = new WebSocket("ws://localhost:5555/ws");


    this.websocket.onopen = function() {
      console.log('Webthis.websocket connected!');
      //@ts-ignore
      this.websocket.send('Hello from the client!');
    };
    
    this.websocket.onmessage = function(event) {
      console.log('Message from server:', event.data);
    };
    
    this.websocket.onerror = function(event) {
      console.error('Webthis.websocket error:', event);
    };
    
    this.websocket.onclose = function(event) {
      console.log('Webthis.websocket closed:', event);
    };


    this.websocket.addEventListener("message", (event) => {
      console.log("HELLO!")
      console.log(event)
      const data = JSON.parse(event.data);
      const gameState = window.store.getGameState();
      window.store.updateGameState({
        ...gameState,
        ball: {
          x: data.ball.x,
          y: data.ball.y,
          direction: {
            x: data.ball.dx,
            y: data.ball.sdy,
          },
        },
      });
    });

    requestAnimationFrame(() => {
      updateBallPosition(this, this.websocket as WebSocket);
    });

    window.addEventListener("keydown", (event) => this.onKeyDown(event));
    window.addEventListener("keyup", (event) => this.onKeyUp(event));
  }

  designCanvas() {
    this.canvas.width = window.store.getGameState().width;
    this.canvas.height = window.store.getGameState().height;
    const divWrapper = createHtmlElementFromString(`
      <div class="flex justify-center items-center w-full h-full p-10"></div>
      `);
    // this.canvas.classList.add("1");
    divWrapper.appendChild(this.canvas);
    this.appendChild(divWrapper);
  }

  disconnectedCallback() {
    if (this.unsubscribe) this.unsubscribe();
    window.removeEventListener("keydown", (event) => this.onKeyDown(event));
    window.removeEventListener("keyup", (event) => this.onKeyUp(event));
  }

  onKeyDown(event: KeyboardEvent) {
    if (["w", "W", "s", "S", "ArrowUp", "ArrowDown"].includes(event.key)) {
      event.preventDefault();
    }
    this.pressedKeys.add(event.key);
    if (event.key === " " || event.code === "Space") {
      if (this.animationFrameId > -1 && this.running) {
        cancelAnimationFrame(this.animationFrameId);
        this.animationFrameId = -1;
      } else {
        requestAnimationFrame(() =>
          updateBallPosition(this, this.websocket as WebSocket)
        );
      }
    }
  }

  onKeyUp(event: KeyboardEvent) {
    if (["w", "W", "s", "S", "ArrowUp", "ArrowDown"].includes(event.key)) {
      event.preventDefault();
    }
    this.pressedKeys.delete(event.key);
  }

  update() {
    if (!this.ctx) return;
    const gameState = window.store.getGameState();
    this.clearCanvas(this.ctx, gameState);
    this.ctx.fillStyle = "white";
    this.drawBall(this.ctx, gameState);
    this.drawPaddles(this.ctx, gameState);
  }

  clearCanvas(ctx: CanvasRenderingContext2D, gameState: GameState) {
    ctx.clearRect(0, 0, gameState.width, gameState.height);
    ctx.fillStyle = "black";
    ctx.fillRect(0, 0, gameState.width, gameState.height);
  }

  drawBall(ctx: CanvasRenderingContext2D, gameState: GameState) {
    ctx.beginPath();
    ctx.arc(gameState.ball.x, gameState.ball.y, 5, 0, Math.PI * 2);
    ctx.fill();
  }

  drawPaddles(ctx: CanvasRenderingContext2D, gameState: GameState) {
    ctx.fillRect(5, gameState.paddleLeft, 10, 50);
    ctx.fillRect(gameState.width - 15, gameState.paddleRight, 10, 50);
  }
}

customElements.define("match-page", MatchPage);

export { MatchPage };
