import { Game } from "./Game";

// Définition des dimensions de l'écran
const screenWidth = 800;
const screenHeight = 600;

// Création du jeu
const game = new Game(screenWidth, screenHeight);

// Boucle de test (simule plusieurs mises à jour)
for (let i = 0; i < 10; i++) {
    game.update();
    console.log(`Step ${i + 1} - Ball position: x=${game.ball.x}, y=${game.ball.y}`);
}
