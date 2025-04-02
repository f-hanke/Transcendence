// Import AppRouter component (it could be inside ./src/router.js)

import { colog, gameSettings, jlog } from "transcendence";
import "./router/AppRouter.js"; // Assuming the AppRouter is inside `src/` folder
import { AppRouter } from "./router/AppRouter.ts";
import { Store } from "./state/store.js";
import { exampleImage } from "./testing/exampleImage.ts";
import { brepo } from "./utils/utils.ts";
import { State } from "./state/types.ts";
import { ChatUserState } from "./state/chatStateTypes.ts";

document.addEventListener("DOMContentLoaded", () => {
  // necessary to prevent page relaod when clicking on "a"-link elements

  window.colog = (val: any) => colog(val);
  window.jlog = (val: any) => jlog(val);
  window.brepo = (val: any) => brepo(val);

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

  const test_user_id = `userid_${sessionStorage.getItem("transTestId")}`;

  const initialState: State = {
    notificationState: [],
    gameState: {
      matchId: "",
      typeOfGame: "localPvP",
      state: "none",
      paddleLeft: {
        playerId: "P_LEFT_PLAYER",
        paddleSpeed: 0,
        paddleY: 380,
        score: 0,
      },
      paddleRight: {
        playerId: "P_Right_PLAYER",
        paddleSpeed: 0,
        paddleY: 380,
        score: 0,
      },
      ball: {
        x: gameSettings.playerYStart,
        y: gameSettings.playerYStart,
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
      id: test_user_id,
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
    registerState: {
      displayName: "",
      email: "",
    },
    chatMessageState: {
      messages: [],
      recipientId: "safsdf",
    },
    chatUserState: new Map as ChatUserState,
  };

  for (let i = 0; i < 10; i++) {
    if (i < 5) {
      initialState.chatMessageState.messages.push({
        authorId: test_user_id,
        date: "25.12.2025",
        message: "TEST MESSAGE COMING FROM USER",
        recipientId: String(i),
      });
    } else {
      initialState.chatMessageState.messages.push({
        authorId: String(i),
        date: "25.12.2025",
        message: "TEST MESSAGE DIRECTED AT USER",
        recipientId: test_user_id,
      });
    }
    initialState.chatUserState.set("hello", {
      blocked: Math.random() < 0.5,
      friend: Math.random() < 0.5,
      online: Math.random() < 0.5,
      unreadMessages: Math.random() < 0.5,
      displayName: "DisplayName",
      recipientId: String(i),
      email: "test@email.com",
      image: "some BASE64 encoded string",
      lastMessage: "This was the last message!",
    });
  }

  // console.log("DOM CONTENT LOADED!");
  window.store = new Store(initialState);

  const appRouter = document.createElement("app-router") as AppRouter;

  appRouter.addRoute("/matchmaking", "match-making");
  appRouter.addRoute("/testpage", "test-page");
  appRouter.addRoute("/oneVOneLocal", "onevone-local");
  appRouter.addRoute("/userSettings", "user-settings");
  appRouter.addRoute("/manageMatch", "manage-match");
  appRouter.addRoute("/loginPage", "login-page");
  appRouter.addRoute("/registerPage", "register-page");

  appRouter.setProtectedRoutes(["user-settings"]);

  document.body.appendChild(appRouter);
});
