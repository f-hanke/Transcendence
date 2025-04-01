"use strict";
import { Game } from "./Game.js";
import Fastify from "fastify";
import cors from "@fastify/cors";
// import { v4 as uuidv4 } from 'uuid';
import chalk from "chalk";
import { gameServiceTypeGuards, } from "transcendence";
import fastifyWebsocket from "@fastify/websocket";
const fastify = Fastify({ logger: true });
const games = new Map();
const clients = new Map();
// const clientsGames =  new Map<clientId, matchId>();
// const clientsGames =  new Map<matchId, clients[]>();
//  type test = string[]
//  type test = [string, string | null]
//const clients = new Set<ws.WebSocket>();
fastify.register(fastifyWebsocket);
fastify.register(cors, { origin: "*" });
//fastify.register(require('@fastify/websocket'));
// fastify.register(fastifyStatic, {
//   root: path.join(__dirname, '..', 'public'),
//   prefix: '/',
// });
export function sendMessage(socket, msg) {
    socket.send(JSON.stringify(msg));
}
fastify.post("/api/game/start", async (request, reply) => {
    const message = JSON.stringify(request.body, null, 2);
    console.log(chalk.cyan.bold(message));
    // const matchId = uuidv4();
    const { typeOfGame, hostId, oponentId, matchId } = request.body;
    // request.query.clientId
    const game = new Game(typeOfGame, matchId, hostId, oponentId);
    games.set(matchId, game);
    reply.send({ message: "Game started!", matchId });
});
fastify.register(async function (fastify) {
    fastify.get("/ws", { websocket: true }, (socket /* WebSocket */, req /* FastifyRequest */) => {
        const urlParams = new URLSearchParams(req.url.split("?")[1]);
        console.log(req?.query);
        const clientId = urlParams.get("clientId") || "anonymous";
        console.log(chalk.green(`A client with ID: ${clientId} connected via WebSocket`));
        clients.set(clientId, socket);
        //   socket.send(
        //     JSON.stringify({ message: `Hello, ${clientId}! You are connected` })
        //   );
        socket.on("message", (message) => {
            const data = message.toString("utf-8");
            const dataJson = JSON.parse(data);
            if (gameServiceTypeGuards.isClientIsReady(dataJson)) {
                //dataJson.data.matchId;
                console.log(chalk.green(` ${clientId} is ready`));
                setTimeout(() => sendMessage(socket, {
                    type: "serverGameStarted",
                    data: {
                        matchId: dataJson.data.matchId,
                    },
                }), 3000);
                //   setTimeout(() => {
                //     throw new Error("HERE");
                //   }, 10);
                games.get(dataJson.data.matchId).websocket = socket;
                games.get(dataJson.data.matchId)?.startGame();
                //if local or AI => start game
                //if remote , wait for both
            }
            if (gameServiceTypeGuards.isClientUpdatePaddlePosition(dataJson)) {
                games
                    .get(dataJson.data.matchId)
                    ?.updatePaddlePosition(dataJson.data);
            }
            else {
                console.log(chalk.green(` ${clientId} is NOT ready`));
            }
        });
        socket.on("close", () => {
            console.log(chalk.red(`A client with ID: ${clientId} disconnected`));
            clients.delete(clientId);
        });
    });
});
fastify.get("/favicon.ico", async (request, reply) => {
    reply.status(200);
    //.send();
    reply.send({ message: "Game started!" });
});
const start = async () => {
    try {
        await fastify.listen({ port: 3000, host: "0.0.0.0" });
        console.log(chalk.cyan.bold("Server running on http://localhost:3000"));
    }
    catch (err) {
        fastify.log.error(err);
        process.exit(1);
    }
};
start();
