// Import AppRouter component (it could be inside ./src/router.js)

import { generateUniqueId } from "transcendence";
import "./router/AppRouter.js"; // Assuming the AppRouter is inside `src/` folder
import { AppRouter } from "./router/AppRouter.ts";
import { Store } from "./state/store.js";
import { exampleImage } from "./testing/exampleImage.ts";

document.addEventListener("DOMContentLoaded", () => {
  // necessary to prevent page relaod when clicking on "a"-link elements
  document.body.addEventListener("click", (event) => {
    const target = event.target as HTMLAnchorElement;
    if (
      target.tagName === "A" &&
      target.getAttribute("href")?.startsWith("/")
    ) {
      event.preventDefault();
      history.pushState(null, "", target.href);
      window.dispatchEvent(new Event("popstate"));
    }
  });

  // console.log("DOM CONTENT LOADED!");
  window.store = new Store({
    notificationState: [],
    gameState: {
      matchId: "",
      typeOfGame: "localPvP",
      state: "none",
      paddleLeft: {
        playerId: "P_LEFT_PLAYER",
        paddleSpeed: 0,
        paddleY: 380,
      },
      paddleRight: {
        playerId: "P_Right_PLAYER",
        paddleSpeed: 0,
        paddleY: 380,
      },
      ball: {
        x: 200,
        y: 100,
        direction: {
          x: 1,
          y: 1,
        },
      },
    },
    matchmakingState: {
      ownMatch: null,
      otherMatches: [
        {
          hostId: "PONGER",
          oponentId: null,
          matchId: "match_id_1",
        },
        {
          hostId: "PINGER",
          oponentId: null,
          matchId: "match_id_2",
        },
      ],
    },
    userState: {
      image: exampleImage,
      displayName: "TEST_USER",
      friends: ["friend_1_id", "friend_2_id"],
      // id: `userid_${generateUniqueId()}`,
      id: `userid_${sessionStorage.getItem("transTestId")}`,
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
    oneVOneLocalState: {
      player2Name: "",
    },
  });

  const appRouter = document.createElement("app-router") as AppRouter;

  appRouter.addRoute("/matchmaking", "match-making");
  appRouter.addRoute("/testpage", "test-page");
  appRouter.addRoute("/oneVOneLocal", "onevone-local");
  appRouter.addRoute("/userSettings", "user-settings");
  appRouter.addRoute("/runMatch", "run-match");
  appRouter.addRoute("/loginPage", "login-page");

  appRouter.setProtectedRoutes(["user-settings"]);

  document.body.appendChild(appRouter);
});
