import { ChatServiceTypes } from "transcendence";

type ChatUserComponentData = Pick<
  ChatServiceTypes.ChatUser,
  "displayName" | "image" | "online" | "lastMessage" | "unreadMessages"
>;

class ChatUserComponent extends HTMLElement {
  unsubscribeLanguage: null | (() => void);
  displayName: string;
  lastMessage: string;
  unreadMessages: boolean;
  online: boolean;
  image: string;
  constructor() {
    super();
    this.unsubscribeLanguage = null;
    this.displayName = "";
    this.lastMessage = "";
    this.unreadMessages = false;
    this.online = false;
    this.image = "";
  }

  connectedCallback() {
    this.unsubscribeLanguage = window.store.languageStore.subscribe(
      this.render.bind(this)
    );
    this.render();
  }

  disconnectedCallback() {
    if (this.unsubscribeLanguage) this.unsubscribeLanguage();
  }

  render() {
    // const shortMessage =
    //   this.lastMessage.length > 20
    //     ? this.lastMessage.substring(0, 20) + "..."
    //     : this.lastMessage;

    this.innerHTML = `
      <div class="flex items-center justify-between p-3 border-b border-gray-300 bg-white hover:bg-gray-100 cursor-pointer">
        <div class="flex items-center space-x-3">

          <div class="flex flex-col">
                <img src="${this.image}" alt="${
      this.displayName
    }" class="w-10 h-10 rounded-full border-2 border-gray-300">

    <div class="flex items-center justify-between">
    <div class="w-3 h-3 rounded-full ${
                  this.online ? "bg-green-500" : "bg-gray-400"
                }"></div>
          <button class="bg-blue-500 text-white text-xs rounded hover:bg-blue-600">
          🏓
              </button>
    </div>

                
          </div>

          <div class="w-44">
            <p class="text-gray-800">${this.displayName}</p>
            <p class="text-sm text-gray-500 truncate w-full overflow-hidden text-ellipsis whitespace-nowrap">${this.lastMessage}</p>
          </div>
        </div>

        <div class="flex items-center space-x-2">
          <!-- Online Status Indicator -->
         

       
        </div>
      </div>
    `;
  }

  setData(data: ChatUserComponentData) {
    this.displayName = data.displayName;
    this.lastMessage = data.lastMessage;
    this.unreadMessages = data.unreadMessages;
    this.online = data.online;
    this.image = data.image;
    this.render();
  }
}

customElements.define("chat-user-component", ChatUserComponent);

export { ChatUserComponent };
