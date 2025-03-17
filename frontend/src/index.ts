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
  });

  const appRouter = document.createElement("app-router") as AppRouter;

  // Define routes with component tag names
  appRouter.addRoute("/", "home-page"); // Associate "/" route with <my-component>
  appRouter.addRoute("/about", "about-page"); // Associate "/about" route with <another-component>
  appRouter.addRoute("/match", "match-page"); // Associate "/about" route with <another-component>

  // Append the router component to the body or any element in the DOM
  document.body.appendChild(appRouter);
});
