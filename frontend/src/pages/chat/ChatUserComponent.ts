import { ChatServiceTypes, generateUniqueId } from "transcendence";
import { ChatInterface } from "../../backendInterface/chatInterface";

type UserComponentType =
  | "user"
  | "blocked"
  | "friendRequestToAnswer"
  | "friendRequestPending";

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
  recipientId: string;
  focussed: boolean;
  type: UserComponentType;
  friendRequestStatus: ChatServiceTypes.FriendRequestStatus;
  constructor() {
    super();
    this.type = "user";
    this.unsubscribeLanguage = null;
    this.displayName = "";
    this.lastMessage = "";
    this.unreadMessages = false;
    this.online = false;
    this.blocked = false;
    this.friend = false;
    this.focussed = false;
    this.image = "";
    this.recipientId = "";
    this.friendRequestStatus = null;
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
    this.focussed =
      window.store.chatMessageStore.get().recipientId === this.recipientId;
    const focussedStyle =
      this.focussed && this.type === "user"
        ? "shadow-[inset_0_0_0_4px] shadow-blue-500"
        : "";

    const unreadMessagesStyle =
      this.unreadMessages && this.type === "user"
        ? "shadow-[inset_0_0_0_2px] shadow-white"
        : "bg-gray-700";

    const btnAll = "rounded border-2 p-1";
    const btnActive = "hover:bg-gray-500";

    this.innerHTML = `
      <div id="${this.id}_wrapperChatOneUser" class="flex items-center justify-between p-3  hover:bg-gray-600 cursor-pointer select-none ${focussedStyle} ${unreadMessagesStyle} min-h-[100px]">
        <div class="flex items-center space-x-3">
          <div class="flex flex-col">
              <img id="${this.id}_userImage" src="${this.image}" alt="${this.displayName}" class="w-10 h-10 rounded-full shadow-[0_0_0_3px_black] ${onlineClass} mx-2">
              <div id="${this.id}_imageActionsBar" class="flex items-center justify-between mt-2">
                <button id="${this.id}_inviteToPlayBtn" class="text-white text-xs rounded hover:bg-blue-600 text-center">
                🏓
                </button>
              <button id="${this.id}_blockBtn" class="text-white text-xs rounded hover:bg-blue-600 text-center">
              ⛔	
              </button>
              <button id="${this.id}_friendBtn" class="text-white text-xs rounded hover:bg-blue-600 text-center flex items-center justify-center">
              ${friend}
              </button>
            </div>
          </div>
          <div class="w-40 flex flex-col">
            <p class="text-white">${this.displayName}</p>
            <div id="${this.id}_friendsRequestsBarToAnswer" class= "flex">
              <button id="${this.id}_acceptBtn" class="${btnAll} ${btnActive} mr-1">Accept</button>
              <button id="${this.id}_declineBtn" class="${btnAll} ${btnActive} ml-1">Decline</button>
            </div>
            <div id="${this.id}_friendsRequestsBarPending" class= "flex">
              <button class="${btnAll} mr-1 border-gray-500 text-gray-500 border-dashed">PENDING</button>
              <button id="${this.id}_withdrawBtn" class="${btnAll} ${btnActive} mr-1">Withdraw</button>
            </div>
            <div id="${this.id}_blockedBar" class= "flex">
              <button id="${this.id}_unblockBtn" class="${btnAll} ${btnActive}">Unblock</button>
            </div>
            <p  id="${this.id}_lastMessageDisplay" class="text-sm text-gray-500 truncate w-full overflow-hidden text-ellipsis whitespace-nowrap">${this.lastMessage}</p>
          </div>
        </div>
      </div>
 `;

    const image = document.querySelector(
      `#${this.id}_userImage`
    ) as HTMLButtonElement;
    image.addEventListener("click", (event) => {
      event.stopPropagation();
      alert("user profile");
    });

    if (this.type === "user") this.renderUser();
    if (this.type === "blocked") this.renderBlocked();
    if (this.type === "friendRequestToAnswer")
      this.renderFriendRequestToAnswer();
    if (this.type === "friendRequestPending") this.renderFriendRequestPending();
    if (this.friendRequestStatus !== null) this.hideFriendsButton();
  }

  renderFriendRequestPending() {
    this.hideFriendsRequestsBarToAnswer();
    this.hideBlockedBar();
    this.hideLastMessageDisplayBar();
    this.hideImageActionsBar();

    const withdrawBtn = document.querySelector(
      `#${this.id}_withdrawBtn`
    ) as HTMLButtonElement;
    withdrawBtn.addEventListener("click", (event) => {
      event.stopPropagation();
      ChatInterface.sendFriendRequest({
        authorId: window.store.userStore.get().id,
        recipientId: this.recipientId,
        type: "withdrawn",
      });
    });
  }

  renderFriendRequestToAnswer() {
    this.hideFriendsRequestsBarPending();
    this.hideBlockedBar();
    this.hideLastMessageDisplayBar();
    this.hideImageActionsBar();

    const acceptBtn = document.querySelector(
      `#${this.id}_acceptBtn`
    ) as HTMLButtonElement;
    acceptBtn.addEventListener("click", (event) => {
      event.stopPropagation();
      ChatInterface.sendFriendRequest({
        authorId: window.store.userStore.get().id,
        recipientId: this.recipientId,
        type: "accept",
      });
    });

    const declineBtn = document.querySelector(
      `#${this.id}_declineBtn`
    ) as HTMLButtonElement;
    declineBtn.addEventListener("click", (event) => {
      event.stopPropagation();
      ChatInterface.sendFriendRequest({
        authorId: window.store.userStore.get().id,
        recipientId: this.recipientId,
        type: "declined",
      });
    });
  }

  renderBlocked() {
    this.hideFriendsRequestsBarPending();
    this.hideFriendsRequestsBarToAnswer();
    this.hideLastMessageDisplayBar();
    this.hideImageActionsBar();

    const unblockBtn = document.querySelector(
      `#${this.id}_unblockBtn`
    ) as HTMLButtonElement;
    unblockBtn.addEventListener("click", (event) => {
      event.stopPropagation();
      ChatInterface.sendUpdateBlockStatus({
        blockedStatus: false,
        clientId: window.store.userStore.get().id,
        recipientId: this.recipientId,
      });
    });
  }

  renderUser() {
    this.hideFriendsRequestsBarToAnswer();
    this.hideBlockedBar();
    this.hideFriendsRequestsBarPending();

    const inviteToPlayBtn = document.querySelector(
      `#${this.id}_inviteToPlayBtn`
    ) as HTMLButtonElement;
    inviteToPlayBtn.addEventListener("click", (event) => {
      event.stopPropagation();
      ChatInterface.inviteToPlay({
        authorId: window.store.userStore.get().id,
        recipientId: this.recipientId,
      });
    });

    const blockBtn = document.querySelector(
      `#${this.id}_blockBtn`
    ) as HTMLButtonElement;
    blockBtn.addEventListener("click", (event) => {
      event.stopPropagation();
      ChatInterface.sendUpdateBlockStatus({
        blockedStatus: true,
        clientId: window.store.userStore.get().id,
        recipientId: this.recipientId,
      });
    });

    const friendBtn = document.querySelector(
      `#${this.id}_friendBtn`
    ) as HTMLButtonElement;
    friendBtn.addEventListener("click", (event) => {
      event.stopPropagation();
      ChatInterface.sendFriendRequest({
        authorId: window.store.userStore.get().id,
        recipientId: this.recipientId,
        type: this.friend ? "unfriended" : "send",
      });
    });

    const wrapperChatOneUser = document.querySelector(
      `#${this.id}_wrapperChatOneUser`
    ) as HTMLDivElement;
    wrapperChatOneUser.addEventListener("click", () => {
      ChatInterface.requestChatHistory(this.recipientId);
      window.store.chatUserStore.updateChangeUserUnreadMessageStatus(
        this.recipientId,
        false
      );
    });
  }

  setData(data: ChatServiceTypes.ChatUser, type: UserComponentType) {
    // this.displayName = data.displayName;
    this.displayName = data.recipientId;
    this.lastMessage = data.lastMessage;
    this.unreadMessages = data.unreadMessages;
    this.online = data.online;
    this.friend = data.friend;
    this.blocked = data.blocked;
    this.image = data.image;
    this.recipientId = data.recipientId;
    this.friendRequestStatus = data.friendRequestStatus;
    this.type = type;
    this.render();
  }

  hideFriendsButton() {
    const friendsBtn = document.querySelector(
      `#${this.id}_friendBtn`
    ) as HTMLButtonElement;
    friendsBtn.classList.add("invisible");
  }

  hideImageActionsBar() {
    const imageActionsBar = document.querySelector(
      `#${this.id}_imageActionsBar`
    ) as HTMLButtonElement;
    imageActionsBar.classList.add("invisible");
  }

  hideLastMessageDisplayBar() {
    const lastMessageDisplay = document.querySelector(
      `#${this.id}_lastMessageDisplay`
    ) as HTMLButtonElement;
    lastMessageDisplay.classList.add("hidden");
  }

  hideFriendsRequestsBarToAnswer() {
    const friendsRequestsBarToAnswer = document.querySelector(
      `#${this.id}_friendsRequestsBarToAnswer`
    ) as HTMLButtonElement;
    friendsRequestsBarToAnswer.classList.add("hidden");
  }

  hideFriendsRequestsBarPending() {
    const friendsRequestsBarPending = document.querySelector(
      `#${this.id}_friendsRequestsBarPending`
    ) as HTMLButtonElement;
    friendsRequestsBarPending.classList.add("hidden");
  }

  hideBlockedBar() {
    const blockedBar = document.querySelector(
      `#${this.id}_blockedBar`
    ) as HTMLButtonElement;
    blockedBar.classList.add("hidden");
  }
}

customElements.define("chat-user-component", ChatUserComponent);

export { ChatUserComponent };

export type { UserComponentType };
