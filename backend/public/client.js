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

  if (data.type === 'Game started!') {
    console.log("The game has started!");
  }
  if (data.type === 'update') {
    console.log(`Update : Player 1 Y=${data.player1Y}, Player 2 Y=${data.player2Y}`);

    player1Y = data.player1Y;
    player2Y = data.player2Y;

    drawPaddle1(player1Y);
    drawPaddle2(player2Y);
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
    socket.send(JSON.stringify({ type: 'start' }));  // Envoie un objet JSON
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

// socket.onmessage = (event) => {
//   const data = JSON.parse(event.data);

//   if (data.type === 'update') {
//     console.log(`Mise à jour reçue : Player 1 Y=${data.player1Y}, Player 2 Y=${data.player2Y}`);
//     // update the graphic thingy
//   }
// };
