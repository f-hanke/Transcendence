import { MatchPage } from "./pages/runMatch/PongTable";

// Smoothly update ball position
function updateBallPosition(matchPage: MatchPage, websocket: WebSocket) {
  // Get current ball position and direction
  const gameState = window.store.getGameState();

  // const dirX = gameState.ball.direction.x;
  // const dirY = gameState.ball.direction.y;
  // const posX = gameState.ball.x;
  // const posY = gameState.ball.y;
  // const width = gameState.width;
  // const height = gameState.height;

  // let newDirX = dirX;
  // let newDirY = dirY;

  // const speed = 20;

  // const newPosX = posX + dirX * speed;
  // const newPosY = posY + dirY * speed;

  // if (newPosX <= 0 || newPosX >= width) {
  //   newDirX = -dirX;
  //   // newDirY = -dirY;
  // }

  // if (newPosY <= 0 || newPosY >= height) {
  //   // newDirX = -dirX;
  //   newDirY = -dirY;
  // }

  let newPaddleLeft = gameState.paddleLeft;
  let newPaddleRight = gameState.paddleRight;

  if (matchPage.pressedKeys.has("W") || matchPage.pressedKeys.has("w")) {
    newPaddleLeft = newPaddleLeft - 5;
  }
  if (matchPage.pressedKeys.has("S") || matchPage.pressedKeys.has("s")) {
    newPaddleLeft = newPaddleLeft + 5;
  }
  if (matchPage.pressedKeys.has("ArrowUp")) {
    newPaddleRight = newPaddleRight - 5;
  }
  if (matchPage.pressedKeys.has("ArrowDown")) {
    newPaddleRight = newPaddleRight + 5;
  }


  if(newPaddleLeft != gameState.paddleLeft || newPaddleRight != gameState.paddleRight)
  {
    websocket.send(JSON.stringify({ type: "paddle", paddleLeft: newPaddleLeft, paddleRight: newPaddleRight }));
  }  

  window.store.updateGameState({
    ...gameState,
    // ball: {
    //   x: newPosX,
    //   y: newPosY,
    //   direction: {
    //     x: newDirX,
    //     y: newDirY,
    //   },
    // },
    paddleLeft: newPaddleLeft,
    paddleRight: newPaddleRight,
  });

  matchPage.animationFrameId = requestAnimationFrame(() =>
    updateBallPosition(matchPage, websocket)
  );
}

// Define the function that will be called when the "A" key is pressed
// function onKeyDown(event: KeyboardEvent) {
//   if (event.key === "a" || event.key === "A") {
//     console.log("The 'A' key was pressed!");
//     updateBallPosition();
//   }
// }

export { updateBallPosition };
