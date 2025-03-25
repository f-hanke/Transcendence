class MatchScore extends HTMLElement {
  unsubscribeLanguage: null | (() => void);
  leftPaddleY: HTMLDivElement;
  leftPaddleSpeed: HTMLDivElement;
  rightPaddleY: HTMLDivElement;
  rightPaddleSpeed: HTMLDivElement;
  ballX: HTMLDivElement;
  ballY: HTMLDivElement;
  constructor() {
    super();
    this.unsubscribeLanguage = null;
    this.innerHTML = `
    <div class="absolute top-4 left-1/2 transform -translate-x-1/2 bg-black bg-opacity-70 text-white p-4 rounded-md w-96 flex justify-between text-sm">
      <!-- Left Paddle Info -->
      <div class="text-left">
        <div id="left-paddle" class="font-semibold">Left Paddle</div>
        <div id="left-paddle-pos">Y: 0</div>
        <div id="left-paddle-speed">Speed: 0</div>
      </div>

      <!-- Right Paddle Info -->
      <div class="text-right">
        <div id="right-paddle" class="font-semibold">Right Paddle</div>
        <div id="right-paddle-pos">Y: 0</div>
        <div id="right-paddle-speed">Speed: 0</div>
      </div>

      <!-- Ball Info (Centered) -->
      <div class="absolute bottom-[-1.5rem] left-1/2 transform -translate-x-1/2 text-center">
        <div id="ball-pos" class="font-semibold px-2 py-1 rounded text-xs">
          Ball:
          <div id="ball-pos-x">X=0</div>
          <div id="ball-pos-y">Y=0</div>
        </div>
      </div>
    </div>  
    `;

    this.leftPaddleY = document.querySelector(
      "#left-paddle-pos"
    ) as HTMLDivElement;
    this.leftPaddleSpeed = document.querySelector(
      "#left-paddle-speed"
    ) as HTMLDivElement;
    this.rightPaddleY = document.querySelector(
      "#right-paddle-pos"
    ) as HTMLDivElement;
    this.rightPaddleSpeed = document.querySelector(
      "#right-paddle-speed"
    ) as HTMLDivElement;
    this.ballX = document.querySelector("#ball-pos-x") as HTMLDivElement;
    this.ballY = document.querySelector("#ball-pos-y") as HTMLDivElement;
  }

  connectedCallback() {
    this.unsubscribeLanguage = window.store.languageStore.subscribe(() =>
      this.render()
    );
  }

  disconnectedCallback() {
    if (this.unsubscribeLanguage) this.unsubscribeLanguage();
  }

  update() {
    const gameState = window.store.gameStore.get();
    this.leftPaddleY.innerHTML = `Y = ${String(gameState.paddleLeft.paddleY)}`;
    this.leftPaddleSpeed.innerHTML = `S = ${String(
      gameState.paddleLeft.paddleSpeed
    )}`;
    this.rightPaddleY.innerHTML = `Y = ${String(
      gameState.paddleRight.paddleY
    )}`;
    this.rightPaddleSpeed.innerHTML = `S = ${String(
      gameState.paddleRight.paddleSpeed
    )}`;
    this.ballX.innerHTML = `X = ${String(gameState.ball.x)}`;
    this.ballY.innerHTML = `Y = ${String(gameState.ball.y)}`;
  }

  render() {}
}

customElements.define("match-score", MatchScore);

export { MatchScore };
