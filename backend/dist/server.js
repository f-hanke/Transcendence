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
const clientsGames = new Map(); //clientId -> matchId
fastify.register(fastifyWebsocket);
fastify.register(cors, { origin: "*" });
export function sendMessage(socket, msg) {
    socket.send(JSON.stringify(msg));
}
fastify.post("/api/game/start", async (request, reply) => {
    const message = JSON.stringify(request.body, null, 2);
    console.log(chalk.cyan.bold(message));
    const { typeOfGame, hostId, oponentId, matchId } = request.body;
    const game = new Game(typeOfGame, matchId, hostId, oponentId);
    games.set(matchId, game);
    clientsGames.set(hostId, matchId);
    clientsGames.set(oponentId, matchId);
    reply.send({ message: "Game started!", matchId });
});
fastify.register(async function (fastify) {
    fastify.get("/ws", { websocket: true }, (socket /* WebSocket */, req /* FastifyRequest */) => {
        const urlParams = new URLSearchParams(req.url.split("?")[1]);
        //console.log(req?.query);
        const clientId = urlParams.get("clientId") || "anonymous";
        console.log(chalk.green(`A client with ID: ${clientId} connected via WebSocket`));
        clients.set(clientId, socket);
        /*------------------------------------------------------------*/
        socket.on("message", (message) => {
            const data = message.toString("utf-8");
            const dataJson = JSON.parse(data);
            if (gameServiceTypeGuards.isClientIsReady(dataJson)) {
                console.log(chalk.green(` ${clientId} is ready`));
                setTimeout(() => sendMessage(socket, {
                    type: "serverGameStarted",
                    data: {
                        matchId: dataJson.data.matchId,
                    },
                }), 1000);
                games.get(dataJson.data.matchId).websocket = socket;
                //if local or AI => start game
                games.get(dataJson.data.matchId)?.startGame();
                //if remote , wait for both
            }
            if (gameServiceTypeGuards.isClientUpdatePaddlePosition(dataJson)) {
                games
                    .get(dataJson.data.matchId)
                    ?.updatePaddlePosition(dataJson.data);
            }
            /*Not sure*/
            if (gameServiceTypeGuards.isClientLeftGame(dataJson)) {
                const game = games.get(dataJson.data.matchId);
                game?.stopGame("playerLeftGame");
                // games.delete(dataJson.data.matchId);
            }
        });
        /*------------------------------------------------------------*/
        socket.on("close", () => {
            console.log(chalk.red(`A client with ID: ${clientId} disconnected`));
            const matchId = clientsGames.get(clientId);
            clients.delete(clientId);
            clientsGames.delete(clientId);
            if (matchId) {
                const game = games.get(matchId);
                game?.stopGame("playerDisconnected");
                if (game) {
                    const otherPlayerId = game.player1.id === clientId ? game.player2.id : game.player1.id;
                    //   if (clients.has(otherPlayerId)) {
                    //sebd to other client that stayed that he won
                    //   }
                    games.delete(matchId);
                }
            }
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
        await fastify.listen({ port: 3001, host: "0.0.0.0" });
        console.log(chalk.cyan.bold("Server running on http://localhost:3001"));
    }
    catch (err) {
        fastify.log.error(err);
        process.exit(1);
    }
};
start();
