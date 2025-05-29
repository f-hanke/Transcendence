type GameSettings = {
  paddleWidth: number;
  paddleHeight: number;
  paddleMaxY: number;
  paddleMinY: number;
  pongTableWidth: number;
  pongTableHeight: number;
  bumperHeight: number;
  canvasHeight: number;
  ballRadius: number;
  maxScore: number;
  ballSpeed: number;
  paddleSpeed: number;
  playerYStart: number;
  player1XStart: number;
  player2XStart: number;
  ballXStart: number;
  ballYStart: number;
};

const gameSettings: GameSettings = {
  paddleWidth: 5,
  paddleHeight: 50,
  playerYStart: -1,
  player1XStart: -1,
  player2XStart: -1,
  // without bumpers, playable field
  pongTableWidth: 800,
  pongTableHeight: 400,
  // bumpers are drawn in addition to playable field
  bumperHeight: 10,
  ballRadius: 5,
  maxScore: 1000,
  ballSpeed: 4,
  paddleSpeed: 3,
  canvasHeight: -1,
  paddleMaxY: -1,
  paddleMinY: -1,
  ballXStart: -1,
  ballYStart: -1,
};

gameSettings.canvasHeight =
  gameSettings.pongTableHeight + 2 * gameSettings.bumperHeight;

gameSettings.paddleMaxY = gameSettings.pongTableHeight + gameSettings.bumperHeight - gameSettings.paddleHeight / 2;
gameSettings.paddleMinY = gameSettings.bumperHeight + gameSettings.paddleHeight / 2;
gameSettings.playerYStart = ( gameSettings.paddleMaxY - gameSettings.paddleMinY ) / 2 + gameSettings.paddleMinY;
gameSettings.player1XStart =  gameSettings.paddleWidth/2;
gameSettings.player2XStart = gameSettings.pongTableWidth - gameSettings.paddleWidth/2;

export { gameSettings };

export type { GameSettings };
