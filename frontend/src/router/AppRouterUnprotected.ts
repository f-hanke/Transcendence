import { Page } from "./types.js";
import { createHtmlElementFromString, navigateToSite } from "../utils/utils.ts";
import { isDefined } from "transcendence";

class AppRouterUnprotected extends HTMLElement {
  routes: Record<string, Page>;
  wrapperDivLogin: HTMLDivElement;
  constructor() {
    super();
    this.routes = {};
    this.wrapperDivLogin = createHtmlElementFromString(
      `<div class='block w-full h-screen'></div>`
    ) as HTMLDivElement;
  }

  connectedCallback() {
    this.appendChild(this.wrapperDivLogin);
  }

  disconnectedCallback() {}

  addRoute(path: string, component: Page) {
    this.routes[path] = component;
  }

  handleRouteChange(isAuthenticated: boolean) {
    const path = window.location.pathname;
    const route = this.routes[path];
    this.wrapperDivLogin.innerHTML = "";

    if(isAuthenticated)
      navigateToSite("/");

    if (isDefined(route)) {
      const element = document.createElement(route);
      this.wrapperDivLogin.appendChild(element);
    } else {
      const element = createHtmlElementFromString("<h2>404 - Not Found</h2>");
      this.wrapperDivLogin.appendChild(element);
    }
  }
}

customElements.define("app-router-unprotected", AppRouterUnprotected);

export { AppRouterUnprotected };
