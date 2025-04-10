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
import "../pages/runMatch/ManageMatch.ts";
import "../pages/runMatch/PongTable.ts";
import "../pages/runMatch/MatchScore.ts";
import "../pages/login/LoginPage.ts";
import "../pages/login/RegisterPage.ts";
import "../pages/ChangeLanguageButton.ts";
import "../pages/matchMaking/ToggleAiButton.ts";
import "../pages/CentralModalButtons.ts";
import "../pages/CentralModalListeners.ts";
import "../pages/chat/ChatLayout.ts";
import "../pages/chat/ChatCurrent.ts";
import "../pages/chat/ChatList.ts";
import "../pages/chat/ChatUserComponent.ts";
import { Page } from "./types.js";
import { createHtmlElementFromString, deepCopyObj } from "../utils/utils.ts";
import { NotificationModal } from "../pages/NotificationModal.ts";
import { Navbar } from "./Navbar.ts";
import { ChangeLanguageButton } from "../pages/ChangeLanguageButton.ts";
import { ChatInterface } from "../backendInterface/chatInterface.ts";
import { colog } from "transcendence";

class AppRouter extends HTMLElement {
  routes: Record<string, Page>;
  protectedRoutes: Page[];
  navbarDiv: HTMLDivElement;
  appDiv: HTMLDivElement;
  wrapperDivApp: HTMLDivElement;
  wrapperDivLogin: HTMLDivElement;
  changeLanguageBtn: ChangeLanguageButton;
  notificationModal: NotificationModal;
  navBar: Navbar;
  constructor() {
    super();
    this.routes = {};
    this.protectedRoutes = [];
    this.wrapperDivLogin = createHtmlElementFromString(
      `<div class='block w-full h-screen'></div>`
    ) as HTMLDivElement;
    this.navbarDiv = createHtmlElementFromString(
      `<div id="navbar" class="w-1/4 h-full"></div>`
    ) as HTMLDivElement;
    this.appDiv = createHtmlElementFromString(
      `<div id="app" class="block w-3/4 h-full"></div>`
    ) as HTMLDivElement;
    this.wrapperDivApp = createHtmlElementFromString(
      `<div class="flex flex-row h-screen"></div>`
    ) as HTMLDivElement;
    this.notificationModal = document.createElement(
      "notification-modal"
    ) as NotificationModal;
    this.navBar = document.createElement("nav-bar") as Navbar;
    this.changeLanguageBtn = createHtmlElementFromString(
      `<change-language-button></change-language-button>`
    ) as ChangeLanguageButton;
  }

  connectedCallback() {
    this.navbarDiv.appendChild(this.navBar);
    this.wrapperDivApp.appendChild(this.navbarDiv);
    this.wrapperDivApp.appendChild(this.appDiv);
    this.wrapperDivApp.appendChild(this.changeLanguageBtn);
    this.appendChild(this.wrapperDivLogin);
    this.appendChild(this.wrapperDivApp);
    this.appendChild(this.notificationModal);
    ChatInterface.connect();
    // this.innerHTML = `
    //   <div class='block w-full h-screen'></div>
    //   <div class="flex flex-row h-screen">
    //     <div id="navbar" class="w-1/4 h-full"></div>
    //     <div id="app" class="w-3/4 h-full"></div>
    //   </div>
    //   <notification-modal></notification-modal>
    // `;
    window.addEventListener("popstate", () => this.handleRouteChange());
    this.handleRouteChange();
  }

  disconnectedCallback() {
    ChatInterface.disconnect();
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
    this.wrapperDivLogin.innerHTML = "";

    if (route) {
      if (this.protectedRoutes.includes(route)) {
        // use api to check whether jwt is valid
        // if not valid, redirect to login page
      }
      const element = document.createElement(route);
      if (route === "login-page") {
        this.renderLogin(element);
      } else if (route === "register-page") {
        this.renderLogin(element);
      } else {
        this.renderApp(element);
      }
    } else {
      const element = createHtmlElementFromString("<h2>404 - Not Found</h2>");
      this.renderApp(element);
    }
  }

  renderApp(element: HTMLElement) {
    if (this.wrapperDivLogin.classList.contains("block"))
      this.wrapperDivLogin.classList.remove("block");
    if (this.wrapperDivApp.classList.contains("hidden"))
      this.wrapperDivApp.classList.remove("hidden");
    this.wrapperDivLogin.classList.add("hidden");
    this.wrapperDivApp.classList.add("block");
    this.appDiv.appendChild(element);
  }

  renderLogin(element: HTMLElement) {
    if (this.wrapperDivApp.classList.contains("block"))
      this.wrapperDivApp.classList.remove("block");
    if (this.wrapperDivLogin.classList.contains("hidden"))
      this.wrapperDivLogin.classList.remove("hidden");
    this.wrapperDivApp.classList.add("hidden");
    this.wrapperDivLogin.classList.add("block");
    this.wrapperDivLogin.appendChild(element);
  }
}

customElements.define("app-router", AppRouter);

export { AppRouter };
