// Import AppRouter component (it could be inside ./src/router.js)

import { colog, jlog } from "transcendence";
import "./router/AppRouter.js"; // Assuming the AppRouter is inside `src/` folder
import { AppRouter } from "./router/AppRouter.ts";
import { brepo } from "./utils/utils.ts";

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

  const appRouter = document.createElement("app-router") as AppRouter;

  document.body.appendChild(appRouter);

  appRouter.addRoute("/matchmaking", "match-making");
  appRouter.addRoute("/currentTournament", "current-tournament");
  appRouter.addRoute("/oneVOneLocal", "onevone-local");
  appRouter.addRoute("/userSettings", "user-settings");
  appRouter.addRoute("/manageMatch", "manage-match");
  appRouter.addRoute("/loginPage", "login-page", false);
  appRouter.addRoute("/registerPage", "register-page", false);
  appRouter.addRoute("/testpage", "test-page");
  appRouter.addRoute("/home", "home-page");
  appRouter.addRoute("/", "home-page");
  appRouter.addRoute("/chat", "chat-layout");
  appRouter.addRoute("/userSettingsOther", "user-settings-other");
  appRouter.addRoute("/userSettingsOwn", "user-settings-own");
  appRouter.handleRouteChange();
});

