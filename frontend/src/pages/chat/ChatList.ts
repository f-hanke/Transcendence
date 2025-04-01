import { createHtmlElementFromString } from "../../utils/utils";
import { ChatUserComponent } from "./ChatUserComponent";

class ChatList extends HTMLElement {
  unsubscribeLanguage: null | (() => void);
  unsubscribeChatUserState: null | (() => void);
  constructor() {
    super();
    this.unsubscribeLanguage = null;
    this.unsubscribeChatUserState = null;
  }

  connectedCallback() {
    this.unsubscribeLanguage = window.store.languageStore.subscribe(
      this.render.bind(this)
    );
    this.unsubscribeChatUserState = window.store.chatUserStore.subscribe(
      this.render.bind(this)
    );
    this.render();
  }

  disconnectedCallback() {
    if (this.unsubscribeLanguage) this.unsubscribeLanguage();
    if (this.unsubscribeChatUserState) this.unsubscribeChatUserState();
  }

  render() {
    this.innerHTML = `
          <!-- Left Panel: User List -->
          <div class="w-72 h-full bg-gray-800 text-white p-4 overflow-y-auto">
            <h2 class="text-lg font-bold mb-4">Users</h2>
            <ul id="userList" class="space-y-2">
              <li class="p-2 bg-gray-700 rounded cursor-pointer">User 1</li>
              <li class="p-2 bg-gray-700 rounded cursor-pointer">User 2</li>
              <li class="p-2 bg-gray-700 rounded cursor-pointer">User 3</li>
            </ul>
          </div>
      `;

    const userListWrapper = this.querySelector("#userList") as HTMLUListElement;

    const elem = createHtmlElementFromString(
      `<chat-user-component></chat-user-component>`
    ) as ChatUserComponent;


    userListWrapper.appendChild(elem);
    elem.setData({
      displayName: "DISPLAY NAME",
      image: "dfsdf",
      lastMessage: "LAST MESSAGE AND MORE AND MORE",
      online: true,
      unreadMessages: true,
    });

  }
}

customElements.define("chat-list", ChatList);

export { ChatList };
