import { ChatServiceTypes } from "transcendence";
import { createHtmlElementFromString } from "../../utils/utils";
import { ChatUserComponent } from "./ChatUserComponent";

type Tabs = "userList" | "blocked";

class ChatList extends HTMLElement {
  unsubscribeLanguage: null | (() => void);
  unsubscribeChatUserState: null | (() => void);
  unsubscribeChatMessageState: null | (() => void);
  selectedTab: Tabs;
  constructor() {
    super();
    this.unsubscribeLanguage = null;
    this.unsubscribeChatUserState = null;
    this.unsubscribeChatMessageState = null;
    this.selectedTab = "userList";
  }

  connectedCallback() {
    this.unsubscribeLanguage = window.store.languageStore.subscribe(
      this.render.bind(this)
    );
    this.unsubscribeChatUserState = window.store.chatUserStore.subscribe(
      this.render.bind(this)
    );
    this.unsubscribeChatMessageState = window.store.chatMessageStore.subscribe(
      this.render.bind(this)
    );
    this.render();
  }

  disconnectedCallback() {
    if (this.unsubscribeLanguage) this.unsubscribeLanguage();
    if (this.unsubscribeChatUserState) this.unsubscribeChatUserState();
    if (this.unsubscribeChatMessageState) this.unsubscribeChatMessageState();
  }

  render() {
    const classBtn = "rounded border-2 mx-2 outline-none p-2 hover:bg-gray-600";
    const classBtnSelected = `${classBtn} border-white`;
    const classBtnNotSelected = `${classBtn} border-gray-700 text-gray-700`;

    this.innerHTML = `
      <div class="w-72 h-full bg-gray-800 text-white p-4 overflow-y-auto">
        <!-- Tabs -->
        <div class="flex justify-start">
          <button id="chatUserTabBtn" class="${
            this.selectedTab === "userList"
              ? classBtnSelected
              : classBtnNotSelected
          }   font-semibold">Users</button>
          <button id="chatBlockedTabBtn" class="${
            this.selectedTab === "blocked"
              ? classBtnSelected
              : classBtnNotSelected
          }">Blocked</button>
        </div>

        <!-- Friends Tab Content -->
        <div id="friendsTab" class="tab-content ${
          this.selectedTab === "userList" ? "" : "hidden"
        }">
          <div id="chatFriendsList">
            <h2 class="text-lg font-bold py-4">Friends</h2>
            <!-- Populate friend users here -->
          </div>
          <div id="chatOnlineUsersList">
            <h2 class="text-lg font-bold py-4">Online</h2>
          </div>
          <div id="chatOfflineUsersList">
            <h2 class="text-lg font-bold py-4">Offline</h2>
          </div>
        </div>

        <!-- Blocked Tab Content -->
        <div id="blockedTab" class="tab-content ${
          this.selectedTab === "blocked" ? "" : "hidden"
        }">
          <div id="chatBlockedUsersList">
            <h2 class="text-lg font-bold py-4">Blocked Users</h2>
          </div>
        </div>
      </div>
    `;

    const chatUserTabBtn = this.querySelector(
      "#chatUserTabBtn"
    ) as HTMLButtonElement;

    chatUserTabBtn.addEventListener("click", () => {
      this.switchTab("userList");
    });

    const chatBlockedTabBtn = this.querySelector(
      "#chatBlockedTabBtn"
    ) as HTMLButtonElement;

    chatBlockedTabBtn.addEventListener("click", () => {
      this.switchTab("blocked");
    });

    if (this.selectedTab === "userList") this.renderUserList();
    if (this.selectedTab === "blocked") this.renderBlockedList();
  }

  createAndAppend(container: HTMLDivElement, user: ChatServiceTypes.ChatUser) {
    const elem = createHtmlElementFromString(
      `<chat-user-component></chat-user-component>`
    ) as ChatUserComponent;
    container.appendChild(elem);
    elem.setData(user);
  }

  renderBlockedList() {
    const userGroups = window.store.chatUserStore.getUserGroups();
    const chatBlockedUsersList = this.querySelector(
      "#chatBlockedUsersList"
    ) as HTMLDivElement;
    
    for (const user of userGroups.blocked) {
      this.createAndAppend(chatBlockedUsersList, user);
    }
  }

  renderUserList() {
    const friendsContainer = this.querySelector(
      "#chatFriendsList"
    ) as HTMLDivElement;
    const onlineContainer = this.querySelector(
      "#chatOnlineUsersList"
    ) as HTMLDivElement;
    const offlineContainer = this.querySelector(
      "#chatOfflineUsersList"
    ) as HTMLDivElement;

    const userGroups = window.store.chatUserStore.getUserGroups();

    for (const user of userGroups.friends) {
      this.createAndAppend(friendsContainer, user);
    }
    for (const user of userGroups.online) {
      this.createAndAppend(onlineContainer, user);
    }
    for (const user of userGroups.offline) {
      this.createAndAppend(offlineContainer, user);
    }
  }

  switchTab(newTab: Tabs) {
    if (newTab !== this.selectedTab) {
      this.selectedTab = newTab;
      this.render();
    }
  }
}

customElements.define("chat-list", ChatList);

export { ChatList };
