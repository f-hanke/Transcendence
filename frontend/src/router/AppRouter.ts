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
import "../pages/runMatch/PongTable.ts";
import "../pages/runMatch/MatchScore.ts";
import "../pages/LoginPage.ts";
import "../pages/ChangeLanguageButton.ts";
import { Page } from "./types.js";
import { createHtmlElementFromString, deepCopyObj } from "../utils/utils.ts";
import { NotificationModal } from "../pages/NotificationModal.ts";
import { Navbar } from "./Navbar.ts";
import { ChangeLanguageButton } from "../pages/ChangeLanguageButton.ts";

class AppRouter extends HTMLElement {
  routes: Record<string, Page>;
  protectedRoutes: Page[];
  navbarDiv: HTMLDivElement;
  appDiv: HTMLDivElement;
  wrapperDiv: HTMLDivElement;
  changeLanguageBtn: ChangeLanguageButton;
  notificationModal: NotificationModal;
  navBar: Navbar;
  constructor() {
    super();
    this.routes = {};
    this.protectedRoutes = [];
    this.navbarDiv = createHtmlElementFromString(
      `<div id="navbar" class="w-1/4 h-full"></div>`
    ) as HTMLDivElement;
    this.appDiv = createHtmlElementFromString(
      `<div id="app" class="w-3/4 h-full"></div>`
    ) as HTMLDivElement;
    this.wrapperDiv = createHtmlElementFromString(
      `<div class="flex flex-row h-screen"></div>`
    ) as HTMLDivElement;
    this.notificationModal = document.createElement(
      "notification-modal"
    ) as NotificationModal;
    this.navBar = document.createElement("nav-bar") as Navbar;
    this.changeLanguageBtn =
      createHtmlElementFromString(`<change-language-button></change-language-button>`) as ChangeLanguageButton;
  }

  connectedCallback() {
    this.navbarDiv.appendChild(this.navBar);
    this.wrapperDiv.appendChild(this.navbarDiv);
    this.wrapperDiv.appendChild(this.appDiv);
    this.wrapperDiv.appendChild(this.changeLanguageBtn);
    this.appendChild(this.wrapperDiv);
    this.appendChild(this.notificationModal);
    // this.innerHTML = `
    //   <div class="flex flex-row h-screen">
    //     <div id="navbar" class="w-1/4 h-full"></div>
    //     <div id="app" class="w-3/4 h-full"></div>
    //   </div>
    //   <notification-modal></notification-modal>
    // `;
    window.addEventListener("popstate", () => this.handleRouteChange());
    this.handleRouteChange();
  }

  addRoute(path: string, component: Page) {
    this.routes[path] = component;
  }

  setProtectedRoutes(protectedRoutes: Page[]) {
    this.protectedRoutes = deepCopyObj(protectedRoutes);
  }

  handleRouteChange() {
    const path = window.location.pathname;
    const route = this.routes[path];

    this.appDiv.innerHTML = "";

    if (route) {
      if (this.protectedRoutes.includes(route)) {
        // use api to check whether jwt is valid
        // if not valid, redirect to login page
      }
      const element = document.createElement(route);
      if (route === "login-page") this.renderLoginPage(element);
      else {
        this.appDiv.appendChild(element);
      }
    } else {
      this.appDiv.innerHTML = "<h2>404 - Not Found</h2>";
    }
  }

  renderLoginPage(element: HTMLElement) {
    const wrapperDiv = createHtmlElementFromString(
      "<div class='w-full h-screen'></div>"
    );
    this.innerHTML = "";
    wrapperDiv.appendChild(element);
    this.appendChild(wrapperDiv);
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
