import { padNumberToString, roundIntToString } from "../../utils/utils";

class MatchScore extends HTMLElement {
  unsubscribeLanguage: null | (() => void);
  leftPaddleY: HTMLDivElement;
  leftPaddleSpeed: HTMLDivElement;
  rightPaddleY: HTMLDivElement;
  rightPaddleSpeed: HTMLDivElement;
  ballX: HTMLDivElement;
  ballY: HTMLDivElement;
  scoreLeft: HTMLDivElement;
  scoreRight: HTMLDivElement;
  leftPlayerNameDisplay: HTMLDivElement;
  rightPlayerNameDisplay: HTMLDivElement;
  constructor() {
    super();
    this.unsubscribeLanguage = null;
    this.innerHTML = `
    <div class="text-lg bg-black bg-opacity-70 text-white p-4 rounded-md w-96 flex w-full justify-center text-sm">
      <div class="text-left w-40">
        <div id="leftPlayerNameDisplay" class="font-semibold">Player_1_Name</div>
        <div class="font-semibold">
          <span>Score:</span>
          <span class="whitespace-pre font-mono" id="leftPlayerScoreDisplay">0</span>
        </div>
        <div>
          <span>Paddle Pos:</span>
          <span class="whitespace-pre font-mono" id="leftPaddlePosDisplay">0</span>
        </div>
        <div>
          <span>Paddle Speed:</span>
          <span class="whitespace-pre font-mono" id="leftPaddleSpeedDisplay">0</span>  
        </div>
      </div>

      <div class="text-center w-40">
        <div id="ball-pos" class="font-semibold px-2 py-1 rounded">
          Ball
          <div >
            <span>X:</span>
            <span class="whitespace-pre font-mono" id="ballPosXDisplay">0</span>
          </div>
          <div>
            <span>Y:</span>
            <span class="whitespace-pre font-mono" id="ballPosYDisplay">0</span>
          </div>
        </div>
      </div>

      <div class="text-right w-40">
        <div id="rightPlayerNameDisplay" class="font-semibold">Player_1_Name</div>
        <div class="font-semibold">
          <span>Score:</span>
          <span class="whitespace-pre font-mono" id="rightPlayerScoreDisplay">0</span>
        </div>
        <div>
          <span>Paddle Pos:</span>
          <span class="whitespace-pre font-mono" id="rightPaddlePosDisplay">0</span>
        </div>
        <div>
          <span>Paddle Speed:</span>
          <span class="whitespace-pre font-mono" id="rightPaddleSpeedDisplay">0</span>  
        </div>
      </div>
    </div>  
    `;

    this.leftPaddleY = document.querySelector(
      "#leftPaddlePosDisplay"
    ) as HTMLDivElement;
    this.leftPaddleSpeed = document.querySelector(
      "#leftPaddleSpeedDisplay"
    ) as HTMLDivElement;
    this.rightPaddleY = document.querySelector(
      "#rightPaddlePosDisplay"
    ) as HTMLDivElement;
    this.rightPaddleSpeed = document.querySelector(
      "#rightPaddleSpeedDisplay"
    ) as HTMLDivElement;
    this.ballX = document.querySelector("#ballPosXDisplay") as HTMLDivElement;
    this.ballY = document.querySelector("#ballPosYDisplay") as HTMLDivElement;

    this.scoreLeft = document.querySelector(
      "#leftPlayerScoreDisplay"
    ) as HTMLDivElement;
    this.scoreRight = document.querySelector(
      "#rightPlayerScoreDisplay"
    ) as HTMLDivElement;

    this.leftPlayerNameDisplay = document.querySelector(
      "#leftPlayerNameDisplay"
    ) as HTMLDivElement;

    this.rightPlayerNameDisplay = document.querySelector(
      "#rightPlayerNameDisplay"
    ) as HTMLDivElement;
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

    this.leftPaddleY.innerHTML = `${String(gameState.paddleLeft.paddleY)}`;
    this.leftPaddleSpeed.innerHTML = `${padNumberToString(
      gameState.paddleLeft.paddleSpeed,
      2
    )}`;
    this.rightPaddleY.innerHTML = `${gameState.paddleRight.paddleY}`;
    this.rightPaddleSpeed.innerHTML = `${padNumberToString(
      gameState.paddleRight.paddleSpeed,
      2
    )}`;
    this.ballX.innerHTML = `${roundIntToString(gameState.ball.x).padStart(
      3,
      " "
    )}`;
    this.ballY.innerHTML = `${roundIntToString(gameState.ball.y).padStart(
      3,
      " "
    )}`;
    this.scoreLeft.innerHTML = `${gameState.paddleLeft.score}`;
    this.scoreRight.innerHTML = `${gameState.paddleRight.score}`;

    this.leftPlayerNameDisplay.innerHTML =
      window.store.playerNamesStore.getName(gameState.paddleLeft.playerId);

    if (["localPvP", "localPvAi"].includes(gameState.typeOfGame)) {
      this.rightPlayerNameDisplay.innerHTML =
        window.store.oneVOneLocalStore.get().player2Name;
    } else {
      this.rightPlayerNameDisplay.innerHTML =
        window.store.playerNamesStore.getName(gameState.paddleRight.playerId);
    }
  }

  render() {}
}

customElements.define("match-score", MatchScore);

export { MatchScore };
