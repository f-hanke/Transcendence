// client.js
const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');

let player1Y = 250;
let player2Y = 250;
let ballX = 400;
let ballY = 300;
let ballRadius = 10;
let ballSpeedX = 3;
let ballSpeedY = 3;

const socket = new WebSocket('ws://localhost:3000/ws');

socket.onopen = () => {
  console.log('Connected to WebSocket server');
};

socket.onmessage = (event) => {
  const data = JSON.parse(event.data);
  console.log('Message from server:', event.data);

  if (data.type === 'Game started!') {
    console.log("The game has started!");
  }
  if (data.type === 'update') {
    console.log(`Update : Player 1 Y=${data.player1Y}, Player 2 Y=${data.player2Y}, Ball = ${data.ball}`);

    player1Y = data.player1Y;
    player2Y = data.player2Y;
    player2Y = data.player2Y;
    ballX = data.ballX;
    ballY = data.ballY;

    drawGame();
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

window.sendMessageToServer = sendMessageToServer;

socket.onerror = (error) => {
  console.error("WebSocket Error:", error);
};

socket.onclose = () => {
  console.log("Disconnected from WebSocket");
};

function startGame() {
  if (socket.readyState === WebSocket.OPEN) {
    socket.send(JSON.stringify({ type: 'start' }));
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

function drawPaddle1(yPosition) {
  console.log("Position of paddle1:", yPosition);
}

function drawPaddle2(yPosition) {
  console.log("Position of paddle2:", yPosition);
}

function drawBall(x, y) {
  console.log(`Drawing ball at position: X=${x}, Y=${y}`);
}

function drawGame() {

  ctx.clearRect(0, 0, canvas.width, canvas.height);


  drawPaddle(10, player1Y);
  drawPaddle(canvas.width - 20, player2Y);


  drawBall(ballX, ballY);
}

function drawPaddle(x, y) {
  ctx.fillStyle = '#FFFFFF';
  ctx.fillRect(x, y, 10, 100);
}

function drawBall(x, y) {
  ctx.fillStyle = '#FFFFFF';
  ctx.beginPath();
  ctx.arc(x, y, ballRadius, 0, Math.PI * 2); 
  ctx.fill();
}
