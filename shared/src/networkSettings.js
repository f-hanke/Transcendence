"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.transNetworkSettings = void 0;
const transNetworkSettings = {
    matchmakingService: {
        // ip: "10.15.204.1",
        ip: "10.15.204.1",
        port: 3000,
    },
    gameService: {
        // ip: "10.15.202.2",
        ip: "10.15.204.1",
        port: 3001
    },
    chatService: {
        ip: "10.15.203.2",
        // ip: "localhost",
        port: 3002
    },
    authService: {
        // ip: "10.11.3.1",
        ip: "localhost",
        port: 3003
    },
};
exports.transNetworkSettings = transNetworkSettings;
