import { Page } from "./types.js";
import { createHtmlElementFromString, deepCopyObj, navigateToSite } from "../utils/utils.ts";
import { ChatInterface } from "../backendInterface/chatInterface.ts";
import { isDefined } from "transcendence";

class AppRouterProtected extends HTMLElement {
  routes: Record<string, Page>;
  protectedRoutes: Page[];
  appDiv: HTMLDivElement;
  constructor() {
    super();
    this.routes = {};
    this.protectedRoutes = [];
    this.appDiv = createHtmlElementFromString("<div></div>") as HTMLDivElement;
  }

  connectedCallback() {
    // ChatInterface.connect();
    this.innerHTML = `
      <div class="flex flex-row h-screen select-none">
        <div id="navbar" class="w-1/4 h-full">
          <nav-bar></nav-bar>
        </div>
        <div id="app" class="w-3/4 h-full"></div>
      </div>
      <notification-modal></notification-modal>
    `;
    this.appDiv = this.querySelector("#app") as HTMLDivElement;
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

  handleRouteChange(isAuthenticated: boolean) {
    const path = window.location.pathname;
    const route = this.routes[path];

    if(!isAuthenticated)
      navigateToSite("/loginPage");

    this.appDiv.innerHTML = "";

    if (isDefined(route)) {
      const element = document.createElement(route);
      this.appDiv.appendChild(element);
    } else {
      const element = createHtmlElementFromString("<h2>404 - Not Found</h2>");
      this.appDiv.appendChild(element);
    }
  }

  curRouteIsProtected() {
    return Object.keys(this.routes).includes(window.location.pathname);
  }
}

customElements.define("app-router-protected", AppRouterProtected);

export { AppRouterProtected };
