import { ChatServiceTypes, generateUniqueId } from "transcendence";

class ChatUserComponent extends HTMLElement {
  unsubscribeLanguage: null | (() => void);
  displayName: string;
  lastMessage: string;
  unreadMessages: boolean;
  online: boolean;
  blocked: boolean;
  friend: boolean;
  image: string;
  id: string;
  constructor() {
    super();
    this.unsubscribeLanguage = null;
    this.displayName = "";
    this.lastMessage = "";
    this.unreadMessages = false;
    this.online = false;
    this.blocked = false;
    this.friend = false;
    this.image = "";
    this.id = generateUniqueId();
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
    const unfriend = `
       <div class="relative w-5 h-5 text-xs flex items-center justify-center">
        <span class="inset-0 flex items-center justify-center">
          <div class="">🧑‍🤝‍🧑</div>
          <div class="absolute left-0 top-0 w-full h-0.5 bg-red-600 transform rotate-45 translate-y-2"></div>
        </span>
      </div>
    `;
    const friend = this.friend ? unfriend : "🧑‍🤝‍🧑";
    const onlineClass = this.online ? "shadow-green-500" : "shadow-gray-400";
    this.innerHTML = `
      <div class="flex items-center justify-between p-3 border-b border-gray-300 bg-gray-700 hover:bg-gray-600 cursor-pointer select-none">
        <div class="flex items-center space-x-3">
          <div class="flex flex-col">
            <img id="${this.id}_userImage" src="${this.image}" alt="${this.displayName}" class="w-10 h-10 rounded-full shadow-[0_0_0_3px_black] ${onlineClass}">

    <div class="flex items-center justify-between mt-2">
          <button id="${this.id}_inviteToPlayBtn" class="text-white text-xs rounded hover:bg-blue-600 text-center">
          🏓
          </button>
          <!-- <button class="text-white text-xs rounded hover:bg-blue-600">
          🧑‍🤝‍🧑
          </button> -->
          <button id="${this.id}_blockBtn" class="text-white text-xs rounded hover:bg-blue-600 text-center">
          ⛔	
          </button>
          <button id="${this.id}_friendBtn" class="text-white text-xs rounded hover:bg-blue-600 text-center flex items-center justify-center">
          ${friend}
          </button>
    </div>

                
          </div>

          <div class="w-40">
            <p class="text-white">${this.displayName}</p>
            <p class="text-sm text-gray-500 truncate w-full overflow-hidden text-ellipsis whitespace-nowrap">${this.lastMessage}</p>
          </div>
        </div>
      </div>
    `;

    const inviteToPlayBtn = document.querySelector(
      `#${this.id}_inviteToPlayBtn`
    ) as HTMLButtonElement;
    inviteToPlayBtn.addEventListener("click", () => {
      alert("invited to play");
    });

    const blockBtn = document.querySelector(`#${this.id}_blockBtn`) as HTMLButtonElement;
    blockBtn.addEventListener("click", () => {
      alert("blocked");
    });

    const friendBtn = document.querySelector(`#${this.id}_friendBtn`) as HTMLButtonElement;
    friendBtn.addEventListener("click", () => {
      alert("friend");
    });

    const image = document.querySelector(`#${this.id}_userImage`) as HTMLButtonElement;
    image.addEventListener("click", () => {
      alert("user profile");
    });
  
  }

  setData(data: ChatServiceTypes.ChatUser) {
    this.displayName = data.displayName;
    this.lastMessage = data.lastMessage;
    this.unreadMessages = data.unreadMessages;
    this.online = data.online;
    this.friend = data.friend;
    this.blocked = data.blocked;
    this.image = data.image;
    this.render();
  }
}

customElements.define("chat-user-component", ChatUserComponent);

export { ChatUserComponent };
