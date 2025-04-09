import { ChatServiceTypes } from "transcendence";
import { createHtmlElementFromString } from "../../utils/utils";
import { ChatUserComponent } from "./ChatUserComponent";

class ChatList extends HTMLElement {
  unsubscribeLanguage: null | (() => void);
  unsubscribeChatUserState: null | (() => void);
  unsubscribeChatMessageState: null | (() => void);
  constructor() {
    super();
    this.unsubscribeLanguage = null;
    this.unsubscribeChatUserState = null;
    this.unsubscribeChatMessageState = null;
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
    this.innerHTML = `
          <!-- Left Panel: User List -->
          <div class="w-72 h-full bg-gray-800 text-white p-4 overflow-y-auto">
            <div id="chatFriendsList">
              <h2 class="text-lg font-bold py-4" class="text-lg font-bold">Friends</h2>
            </div>
            <div id="chatOnlineUsersList">
              <h2 class="text-lg font-bold py-4">Online</h2>
            </div>
            <div id="chatOfflineUsersList">
              <h2 class="text-lg font-bold py-4">Offline</h2>
            </div>
          </div>
      `;

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

  createAndAppend(container: HTMLDivElement, user: ChatServiceTypes.ChatUser) {
    const elem = createHtmlElementFromString(
      `<chat-user-component></chat-user-component>`
    ) as ChatUserComponent;
    container.appendChild(elem);
    elem.setData(user);
  }
}

customElements.define("chat-list", ChatList);

export { ChatList };
