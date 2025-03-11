"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const Game_1 = require("./Game");
// Définition des dimensions de l'écran
const screenWidth = 800;
const screenHeight = 600;
// Création du jeu
const game = new Game_1.Game(screenWidth, screenHeight);
// Boucle de test (simule plusieurs mises à jour)
for (let i = 0; i < 5000; i++) {
    // Mise à jour du jeu
    game.update();
    // Affichage de la position de la balle et du score
    console.log(`Step ${i + 1} - Ball position: x=${game.ball.x}, y=${game.ball.y}`);
    console.log(`Player 1 score: ${game.player1.score}, Player 2 score: ${game.player2.score}`);
    // Vérification si le jeu est terminé
    if (game.isGameOver) {
        console.log("Game Over!");
        break; // Quitte la boucle dès que le jeu est terminé
    }
}
