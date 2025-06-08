// Import all components at the beginning
import "./Navbar.ts";
import "../pages/NotificationModal.ts";
import "../pages/matchMaking/MatchMaking.ts";
import "../pages/matchMaking/MatchItem.ts";
import "../pages/matchMaking/TournamentItem.ts";
import "../pages/matchMaking/OneVOneLocal.ts";
import "../testing/TestPage.ts";
import "../pages/UserSettings.ts";
import "../pages/UserSettingsOther.ts";
import "../pages/UserSettingsOwn.ts";
import "../pages/CurrentTournament.ts";
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
import "../pages/HomePage.ts";
import "./AppRouterProtected.ts";
import "./AppRouterUnprotected.ts";
import { Page } from "./types.js";
import { createHtmlElementFromString } from "../utils/utils.ts";
import { ChangeLanguageButton } from "../pages/ChangeLanguageButton.ts";
import { ChatInterface } from "../backendInterface/chatInterface.ts";
import { AppRouterUnprotected } from "./AppRouterUnprotected.ts";
import { AppRouterProtected } from "./AppRouterProtected.ts";
import { AuthInterface } from "../backendInterface/authInterface.ts";
import { UserInterface } from "../backendInterface/userInterface.ts";
import { transStore } from "../state/store";

class AppRouter extends HTMLElement {
  // routes: Record<string, Page>;
  protectedRoutes: Page[];
  changeLanguageBtn: ChangeLanguageButton;
  appRouterUnprotected: AppRouterUnprotected;
  appRouterProtected: AppRouterProtected;
  constructor() {
    super();
    // this.routes = {};
    this.protectedRoutes = [];
    this.changeLanguageBtn = createHtmlElementFromString(
      `<change-language-button class="select-none"></change-language-button>`
    ) as ChangeLanguageButton;
    this.appRouterUnprotected = createHtmlElementFromString(
      `<app-router-unprotected class="hidden"></app-router-unprotected>`
    ) as AppRouterUnprotected;
    this.appRouterProtected = createHtmlElementFromString(
      `<app-router-protected class="hidden"></app-router-protected>`
    ) as AppRouterProtected;
  }

  connectedCallback() {
    this.innerHTML = "";
    this.appendChild(this.appRouterUnprotected);
    this.appendChild(this.appRouterProtected);
    this.appendChild(this.changeLanguageBtn);
    window.addEventListener("popstate", () => this.handleRouteChange());
  }

  disconnectedCallback() {
    ChatInterface.disconnect();
  }

  addRoute(path: string, component: Page, isProtected: boolean = true) {
    if (isProtected) {
      this.appRouterProtected.addRoute(path, component);
      this.protectedRoutes.push(component);
    } else {
      this.appRouterUnprotected.addRoute(path, component);
    }
  }

  async handleRouteChange() {
    // Check if JWT token exists before trying to verify
    const hasToken = sessionStorage.getItem(AuthInterface.nameJwtInSessionStorage);
    const isAuthenticated = hasToken ? await AuthInterface.verify(true) : { ok: false };
    
    if (this.appRouterProtected.curRouteIsProtected()) {
      if (isAuthenticated.ok) {
        ChatInterface.connect();
        if (transStore.userStore.get().details.fetchNeeded) {
          const resDisplayNames = await UserInterface.getAllDisplayNames();
          if (!resDisplayNames.ok) {
            const msg = `Failed to fetch id to displayNames map!`;
            console.log(msg);
          }
          const resUserDetails = await UserInterface.getAllUserDetails(
            transStore.userStore.get().details.id
          );
          if (!resUserDetails.ok) {
            const msg = `Failed to fetch user details!`;
            console.log(msg);
          }
        }
      }
      this.appRouterProtected.handleRouteChange(isAuthenticated.ok);
      this.showProtectedAppRouter();
    } else {
      ChatInterface.disconnect();
      this.appRouterUnprotected.handleRouteChange(isAuthenticated.ok);
      this.showUnProtectedAppRouter();
    }
  }

  showProtectedAppRouter() {
    this.appRouterProtected.classList.remove("hidden");
    this.appRouterUnprotected.classList.add("hidden");
  }

  showUnProtectedAppRouter() {
    this.appRouterUnprotected.classList.remove("hidden");
    this.appRouterProtected.classList.add("hidden");
  }
}

customElements.define("app-router", AppRouter);

export { AppRouter };
