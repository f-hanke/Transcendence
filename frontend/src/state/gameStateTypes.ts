type GameState = {
  paddleLeft: number;
  paddleRight: number;
  ball: {
    x: number;
    y: number;
    direction: {
      x: number;
      y: number;
    };
  };
  width: number;
  height: number;
};

export type {
  GameState
}