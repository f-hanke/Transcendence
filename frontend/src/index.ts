// Import AppRouter component (it could be inside ./src/router.js)

import "./router/AppRouter.js"; // Assuming the AppRouter is inside `src/` folder
import { AppRouter } from "./router/AppRouter.ts";
import { Store } from "./state/store.js";

document.addEventListener("DOMContentLoaded", () => {
  window.store = new Store({
    notificationState: [],
    gameState: {
      paddleLeft: 0.5,
      paddleRight: 0.5,
      ball: {
        x: 200,
        y: 100,
        direction: {
          x: 1,
          y: 1,
        },
      },
      height: 300,
      width: 600,
    },
    matchmakingState: {
      ownMatch: null,
      otherMatches: [
        {
          hostId: "PONGER",
          hostNickName: "PONGER",
          matchId: "match_id_1",
        },
        {
          hostId: "PINGER",
          hostNickName: "PINGER",
          matchId: "match_id_2",
        },
      ],
    },
    userState: {
      avatar: "",
      displayName: "TEST_USER",
      friends: ["friend_1_id", "friend_2_id"],
      id: "TEST_USER",
      email: "test@user.de",
      matchHistory: [
        {
          date: "15.02.2025",
          player1Id: "TEST_USER",
          player2Id: "friend_1_id",
          result: {
            player1: 1,
            player2: 7,
          },
          tournament: null,
        },
      ],
      online: true,
    },
  });

  const appRouter = document.createElement("app-router") as AppRouter;

  // Define routes with component tag names
  appRouter.addRoute("/", "home-page"); // Associate "/" route with <my-component>
  appRouter.addRoute("/about", "about-page"); // Associate "/about" route with <another-component>
  appRouter.addRoute("/match", "match-page"); // Associate "/about" route with <another-component>

  // Append the router component to the body or any element in the DOM
  document.body.appendChild(appRouter);
});
