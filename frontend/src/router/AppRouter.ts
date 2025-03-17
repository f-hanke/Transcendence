// Import all components at the beginning
import { NotificationModal } from "../components/notification-modal.ts";
import "../pages/AboutPage.js";
import "../pages/HomePage.js";
import "../pages/Match.ts";
import "./Navbar.ts";
import "../components/notification-modal.ts";
import { Page } from "./types.js";
import { generateUniqueId } from "../utils/utils.ts";

class AppRouter extends HTMLElement {
  routes: Record<string, Page>;
  constructor() {
    super();
    this.routes = {};
  }

  connectedCallback() {
    this.innerHTML = `
      <div class="flex flex-row h-screen">
        <div id="navbar"></div>
        <div id="app"></div>
      </div>
      <notification-modal></notification-modal>
    `;
    const navbarContainer = this.querySelector("#navbar") as HTMLDivElement;
    const navbar = document.createElement("nav-bar");
    navbarContainer.appendChild(navbar);

    // Listen to URL changes
    window.addEventListener("popstate", () => this.handleRouteChange());
    this.handleRouteChange(); // Initial route change on page load

    console.log("HI!");
    document.querySelector("#querynotifyBtn")?.addEventListener("click", () => {
      window.store.updateNotificationState([
        ...window.store.getNotificationState(),
        [generateUniqueId(), `This is a notification!`],
      ]);
      console.log("clicked!");
    });
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
