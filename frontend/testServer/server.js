import fastify from 'fastify';
import websocket from '@fastify/websocket'; // Updated import
import fs from 'fs';
import fastifyCors from '@fastify/cors';

// Create a Fastify instance
const app = fastify();

// Register CORS
app.register(fastifyCors, {
  origin: "*",  // Or restrict it to certain domains
  methods: ['GET', 'POST']
});

// Register the websocket plugin
app.register(websocket);

// Define a route that accepts WebSocket connections
app.get('/ws', { websocket: true }, (connection, request) => {
  console.log('Client connected');
  
  // When the client sends a message, the server will handle it
  connection.on('message', message => {
    console.log('Received message:', message);
    
    // You can send a message back to the client
    connection.send('Hello from the server!');
  });

  // Handle when the connection closes
  connection.on('close', () => {
    console.log('Client disconnected');
  });
});

// Correct way to start the server with listen
const PORT = 5555;
app.listen({ port: PORT }, (err, address) => {
  if (err) {
    console.error(err);
    process.exit(1);
  }
  console.log(`Server listening at ${address}`);
});



// import { WebSocketServer } from "ws";


// // Game settings
// const WIDTH = 600,
//   HEIGHT = 300;
// const BALL_SPEED = 5;
// const PADDLE_WIDTH = 10;
// const PADDLE_HEIGHT = 50;

// // Ball state
// let ball = { x: WIDTH / 2, y: HEIGHT / 2, dx: BALL_SPEED, dy: BALL_SPEED };

// // Paddle state
// let paddles = {
//     leftY: HEIGHT / 2 - PADDLE_HEIGHT / 2,
//     rightY: HEIGHT / 2 - PADDLE_HEIGHT / 2
//   };

// // Create WebSocket server
// const wss = new WebSocketServer({ port: 8080 });

// wss.on("connection", (ws) => {
//   console.log("Client connected");

//   // Send initial ball state
//   ws.send(JSON.stringify({ type: "ball", ball }));

//   // Listen for paddle movement from clients
//   ws.on("message", (message) => {
//     const data = JSON.parse(message.toString());
//     if (data.type === "paddle") {
//         paddles.leftY = data.paddleLeft
//         paddles.rightY =data.paddleRight
//     }
//   });

//   // Remove client on disconnect
//   ws.on("close", () => {
//     console.log("Client disconnected");
//   });
// });

// // **Game Loop**: Update ball position, check collisions, broadcast state
// setInterval(() => {
//     ball.x += ball.dx;
//     ball.y += ball.dy;
  
//     // Collision with top/bottom walls
//     if (ball.y <= 0 || ball.y >= HEIGHT) {
//       ball.dy *= -1; // Reverse direction
//     }
  
//     // **Collision with paddles**
//     if (
//       ball.x <= 30 && // Left paddle x position
//       ball.y >= paddles.leftY &&
//       ball.y <= paddles.leftY + PADDLE_HEIGHT
//     ) {
//       ball.dx *= -1; // Bounce ball
//     }
  
//     if (
//       ball.x >= WIDTH - 30 && // Right paddle x position
//       ball.y >= paddles.rightY &&
//       ball.y <= paddles.rightY + PADDLE_HEIGHT
//     ) {
//       ball.dx *= -1; // Bounce ball
//     }
  
//     // **Reset ball if it goes past paddles**
//     if (ball.x <= 0 || ball.x >= WIDTH) {
//       ball.x = WIDTH / 2;
//       ball.y = HEIGHT / 2;
//       ball.dx = BALL_SPEED * (Math.random() > 0.5 ? 1 : -1);
//       ball.dy = BALL_SPEED * (Math.random() > 0.5 ? 1 : -1);
//     }
  
//     // Broadcast updated game state to all clients
//     wss.clients.forEach((client) => {
//       if (client.readyState === 1) {
//         client.send(JSON.stringify({ type: "state", ball, paddles }));
//       }
//     });
//   }, 1000 / 60); // 60 FPS update rate
  
// console.log("WebSocket server running on ws://localhost:8080");
