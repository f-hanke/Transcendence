// client.js


const socket = new WebSocket('ws://localhost:3000/ws');

socket.onopen = () => {
  console.log('Connected to WebSocket server');
 // socket.send('start game');
  //socket.send('Hello from the client!');
};

socket.onmessage = (event) => {
  const data = JSON.parse(event.data);
  console.log('Message from server:', event.data);

  if (data.message === 'Game started!') {
    console.log("The game has started!");

  if (data.type === 'update') {
      console.log(`Update: Player 1 Y=${data.player1Y}, Player 2 Y=${data.player2Y}`);
    }
    //socket.send(message);
  }
};

function sendMessageToServer(message) {
  if (socket.readyState === WebSocket.OPEN) {
    socket.send(message);
    console.log(`Sent message: ${message}`);
  } else {
    console.log('WebSocket is not connected.');
  }
}

// Pour rendre la fonction accessible directement dans la console
window.sendMessageToServer = sendMessageToServer;

socket.onerror = (error) => {
  console.error("WebSocket Error:", error);
};

socket.onclose = () => {
  console.log("Disconnected from WebSocket");
};

function startGame() {
  if (socket.readyState === WebSocket.OPEN) {
    socket.send('start game');
    console.log('Command "start game" sent to the server.');
  } else {
    console.log('WebSocket is not connected.');
  }
}

document.addEventListener('keydown', (event) => {
  let message = null;

  if (event.key === 'ArrowUp') {
    message = { type: 'move', player: 2, direction: 'up' };
  } else if (event.key === 'ArrowDown') {
    message = { type: 'move', player: 2, direction: 'down' };
  } else if (event.key === 'w') {
    message = { type: 'move', player: 1, direction: 'up' };
  } else if (event.key === 's') {
    message = { type: 'move', player: 1, direction: 'down' };
  }

  if (message) {
    socket.send(JSON.stringify(message));
  }
});

socket.onmessage = (event) => {
  const data = JSON.parse(event.data);

  if (data.type === 'update') {
    console.log(`Mise à jour reçue : Player 1 Y=${data.player1Y}, Player 2 Y=${data.player2Y}`);
    // update the graphic thingy
  }
};



// Get the canvas element and its context
// const canvas = document.getElementById('gameCanvas');
// const ctx = canvas.getContext('2d');

// // Set up game variables
// const paddleWidth = 10;
// const paddleHeight = 100;
// const ballRadius = 10;
// let ballX = canvas.width / 2;
// let ballY = canvas.height / 2;
// let ballSpeedX = 4;
// let ballSpeedY = 3;
// let player1Y = (canvas.height - paddleHeight) / 2;
// let player2Y = (canvas.height - paddleHeight) / 2;

// console.log("Hello");

// // Function to draw the game
// function drawGame() {
//   ctx.clearRect(0, 0, canvas.width, canvas.height); // Clear the canvas

//   // Draw paddles
//   ctx.fillStyle = 'black';
//   ctx.fillRect(10, player1Y, paddleWidth, paddleHeight); // Player 1 paddle
//   ctx.fillRect(canvas.width - paddleWidth - 10, player2Y, paddleWidth, paddleHeight); // Player 2 paddle

//   // Draw ball
//   ctx.beginPath();
//   ctx.arc(ballX, ballY, ballRadius, 0, Math.PI * 2);
//   ctx.fill();

//   // Move the ball
//   ballX += ballSpeedX;
//   ballY += ballSpeedY;

//   // Ball collision with the top and bottom walls
//   if (ballY - ballRadius <= 0 || ballY + ballRadius >= canvas.height) {
//     ballSpeedY *= -1;
//   }

//   // Ball collision with paddles
//   if (ballX - ballRadius <= 10 + paddleWidth && ballY >= player1Y && ballY <= player1Y + paddleHeight) {
//     ballSpeedX *= -1;
//   }
//   if (ballX + ballRadius >= canvas.width - paddleWidth - 10 && ballY >= player2Y && ballY <= player2Y + paddleHeight) {
//     ballSpeedX *= -1;
//   }

//   // Ball out of bounds (score)
//   if (ballX - ballRadius <= 0 || ballX + ballRadius >= canvas.width) {
//     ballX = canvas.width / 2;
//     ballY = canvas.height / 2;
//     ballSpeedX *= -1;
//   }
// }

// // Update the game
// function updateGame() {
//   drawGame();
//   requestAnimationFrame(updateGame);
// }


// updateGame();



// });
