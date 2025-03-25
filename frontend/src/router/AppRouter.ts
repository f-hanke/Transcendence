// Import all components at the beginning
import "../pages/runMatch/PongTable.ts";
import "./Navbar.ts";
import "../pages/NotificationModal.ts";
import "../pages/matchMaking/MatchMaking.ts";
import "../pages/matchMaking/MatchItem.ts";
import "../pages/matchMaking/OneVOneLocal.ts";
import "../testing/TestPage.ts";
import "../pages/UserSettings.ts";
import "../pages/runMatch/RunMatch.ts";
import "../pages/runMatch/PongTable.ts"
import "../pages/runMatch/MatchScore.ts"
import { Page } from "./types.js";

class AppRouter extends HTMLElement {
  routes: Record<string, Page>;
  constructor() {
    super();
    this.routes = {};
  }

  connectedCallback() {
    this.innerHTML = `
      <div class="flex flex-row h-screen">
        <div id="navbar" class="w-1/4 h-full"></div>
        <div id="app" class="w-3/4 h-full"></div>
      </div>
      <notification-modal></notification-modal>
    `;
    const navbarContainer = this.querySelector("#navbar") as HTMLDivElement;
    const navbar = document.createElement("nav-bar");
    navbarContainer.appendChild(navbar);

    // Listen to URL changes
    window.addEventListener("popstate", () => this.handleRouteChange());
    this.handleRouteChange(); // Initial route change on page load
  }

  // Add routes to the AppRouter
  addRoute(path: string, component: Page) {
    this.routes[path] = component;
  }

  // Handle route change and render corresponding component
  handleRouteChange() {
    const path = window.location.pathname;
    const route = this.routes[path];

    const root: HTMLDivElement = document.querySelector(
      "#app"
    ) as HTMLDivElement;
    root.innerHTML = "";

    if (route) {
      // Create the pre-imported component and append it to the root
      const element = document.createElement(route);
      root.appendChild(element);
    } else {
      root.innerHTML = "<h2>404 - Not Found</h2>";
    }
  }
}

customElements.define("app-router", AppRouter);

// function showNotification(message: string) {
//   console.log("showNotification");
//   const notification = document.createElement("notification-modal") as NotificationModal;
//   document.body.appendChild(notification);
//   notification.showNotification(message);
// }

// document.getElementById("notify-btn")?.addEventListener("click", () => {
//   console.log("HI!");
//   showNotification("This is a test notification!");
// });

export { AppRouter };
