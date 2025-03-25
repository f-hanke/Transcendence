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
};

const gameSettings: GameSettings = {
  paddleWidth: 10,
  paddleHeight: 50,
  // without bumpers, playable field
  pongTableWidth: 800,
  pongTableHeight: 400,
  // bumpers are drawn in addition to playable field
  bumperHeight: 10,
  ballRadius: 5,
  maxScore: 7,
  ballSpeed: 3,
  paddleSpeed: 3,
  canvasHeight: -1,
  paddleMaxY: -1,
  paddleMinY: -1,
};

gameSettings.canvasHeight =
  gameSettings.pongTableHeight + 2 * gameSettings.bumperHeight;

gameSettings.paddleMaxY = gameSettings.pongTableHeight + gameSettings.bumperHeight - gameSettings.paddleHeight / 2;
gameSettings.paddleMinY = gameSettings.bumperHeight + gameSettings.paddleHeight / 2;

export { gameSettings };

export type { GameSettings };
