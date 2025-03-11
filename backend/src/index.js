"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var Game_1 = require("./Game");
// Définition des dimensions de l'écran
var screenWidth = 800;
var screenHeight = 600;
// Création du jeu
var game = new Game_1.Game(screenWidth, screenHeight);
// Boucle de test (simule plusieurs mises à jour)
for (var i = 0; i < 10; i++) {
    game.update();
    console.log("Step ".concat(i + 1, " - Ball position: x=").concat(game.ball.x, ", y=").concat(game.ball.y));
}
