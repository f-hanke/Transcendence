import { ChatServiceTypes } from "transcendence";
import { createHtmlElementFromString } from "../../utils/utils";
import { ChatUserComponent, UserComponentType } from "./ChatUserComponent";
import { transStore } from "../../state/store";

type Tabs = "userList" | "blocked" | "friendRequests";

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
    this.unsubscribeLanguage = transStore.languageStore.subscribe(
      this.render.bind(this)
    );
    this.unsubscribeChatUserState = transStore.chatUserStore.subscribe(
      this.render.bind(this)
    );
    this.unsubscribeChatMessageState = transStore.chatMessageStore.subscribe(
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
  const lang = transStore.languageStore.state.chat;

  const classBtn = "flex-1 rounded border-2 outline-none p-1 hover:bg-gray-600";
  const classBtnSelected = `${classBtn} border-white`;
  const classBtnNotSelected = `${classBtn} border-gray-700 text-gray-700`;

  this.innerHTML = `
    <div class="w-80 h-full bg-gray-800 text-white py-2 overflow-y-auto">
      <!-- Tabs -->
      <div class="flex justify-start mx-2">
        <button id="chatUserTabBtn" class="${
          this.selectedTab === "userList" ? classBtnSelected : classBtnNotSelected
        } font-semibold">${lang.tabs.users}</button>
        <button id="chatBlockedTabBtn" class="${
          this.selectedTab === "blocked" ? classBtnSelected : classBtnNotSelected
        }">${lang.tabs.blocked}</button>
        <button id="chatFriendRequestTabBtn" class="${
          this.selectedTab === "friendRequests" ? classBtnSelected : classBtnNotSelected
        }">${lang.tabs.friendRequests}</button>
      </div>

      <!-- Friends Tab Content -->
      <div id="friendsTab" class="tab-content ${
        this.selectedTab === "userList" ? "" : "hidden"
      }">
        <div id="chatNotifierBotList">
          <h2 class="text-lg font-bold py-4">${lang.sections.notifierBots}</h2>
          <!-- Populate friend users here -->
        </div>
        <div id="chatFriendsList">
          <h2 class="text-lg font-bold py-4">${lang.sections.friends}</h2>
          <!-- Populate friend users here -->
        </div>
        <div id="chatOnlineUsersList">
          <h2 class="text-lg font-bold py-4">${lang.sections.online}</h2>
        </div>
        <div id="chatOfflineUsersList">
          <h2 class="text-lg font-bold py-4">${lang.sections.offline}</h2>
        </div>
      </div>

      <!-- Blocked Tab Content -->
      <div id="blockedTab" class="tab-content ${
        this.selectedTab === "blocked" ? "" : "hidden"
      }">
        <div id="chatBlockedUsersList">
          <h2 class="text-lg font-bold py-4">${lang.sections.blockedUsers}</h2>
        </div>
      </div>

      <!-- Friend Requests Tab Content -->
      <div id="friendRequestTab" class="tab-content ${
        this.selectedTab === "friendRequests" ? "" : "hidden"
      }">
        <div id="chatFriendRequestListAnswer">
          <h2 class="text-lg font-bold py-4">${lang.sections.answerRequired}</h2>
        </div>
        <div id="chatFriendRequestListPending">
          <h2 class="text-lg font-bold py-4">${lang.sections.ownPending}</h2>
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

    const chatFriendRequestTabBtn = this.querySelector(
      "#chatFriendRequestTabBtn"
    ) as HTMLButtonElement;

    chatFriendRequestTabBtn.addEventListener("click", () => {
      this.switchTab("friendRequests");
    });

    if (this.selectedTab === "userList") this.renderUserList();
    if (this.selectedTab === "blocked") this.renderBlockedList();
    if (this.selectedTab === "friendRequests") this.renderFriendRequestList();
  }

  createAndAppend(
    container: HTMLDivElement,
    user: ChatServiceTypes.ChatUser,
    type: UserComponentType,
    isBot: boolean = false
  ) {
    const elem = createHtmlElementFromString(
      `<chat-user-component></chat-user-component>`
    ) as ChatUserComponent;
    container.appendChild(elem);
    if(isBot)
    {
      // user.displayName = "I AM BOT";
      user.lastMessage = "GONNADESTROYYOU!"
    }
    elem.setData(user, type, isBot);
  }

  renderBlockedList() {
    const userGroups = transStore.chatUserStore.getUserGroups();
    const chatBlockedUsersList = this.querySelector(
      "#chatBlockedUsersList"
    ) as HTMLDivElement;

    for (const user of userGroups.blocked) {
      this.createAndAppend(chatBlockedUsersList, user, "blocked");
    }
  }

  renderFriendRequestList() {
    const userGroups = transStore.chatUserStore.getUserGroups();
    const chatFriendRequestListAnswer = this.querySelector(
      "#chatFriendRequestListAnswer"
    ) as HTMLDivElement;
    const chatFriendRequestListPending = this.querySelector(
      "#chatFriendRequestListPending"
    ) as HTMLDivElement;

    for (const user of userGroups.pendingRecipientInvite) {
      this.createAndAppend(chatFriendRequestListAnswer, user, "friendRequestToAnswer");
    }
    for (const user of userGroups.pendingClientInvite) {
      this.createAndAppend(chatFriendRequestListPending, user, "friendRequestPending");
    }
  }

  renderUserList() {
    const chatNotifierBotList = this.querySelector(
      "#chatNotifierBotList"
    ) as HTMLDivElement;
    const friendsContainer = this.querySelector(
      "#chatFriendsList"
    ) as HTMLDivElement;
    const onlineContainer = this.querySelector(
      "#chatOnlineUsersList"
    ) as HTMLDivElement;
    const offlineContainer = this.querySelector(
      "#chatOfflineUsersList"
    ) as HTMLDivElement;

    const userGroups = transStore.chatUserStore.getUserGroups();

    for (const user of userGroups.notifierBots) {
      this.createAndAppend(chatNotifierBotList, user, "user", true);
    }
    for (const user of userGroups.friends) {
      this.createAndAppend(friendsContainer, user, "user");
    }
    for (const user of userGroups.online) {
      this.createAndAppend(onlineContainer, user, "user");
    }
    for (const user of userGroups.offline) {
      this.createAndAppend(offlineContainer, user, "user");
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
