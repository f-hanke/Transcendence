import { ChatServiceTypes, generateUniqueId } from "transcendence";
import {
  createHtmlElementFromString,
  getCurDateString,
  navigateToSite,
  renderTournamentNotification,
  sanitizeAndCleanInput,
} from "../../utils/utils";
import { ChatInterface } from "../../backendInterface/chatInterface";

class ChatCurrent extends HTMLElement {
  unsubscribeLanguage: null | (() => void);
  unsubscribeChatMessageState: null | (() => void);
  constructor() {
    super();
    this.unsubscribeLanguage = null;
    this.unsubscribeChatMessageState = null;
  }

  connectedCallback() {
    this.unsubscribeLanguage = window.store.languageStore.subscribe(
      this.render.bind(this)
    );
    this.unsubscribeChatMessageState = window.store.chatMessageStore.subscribe(
      this.render.bind(this)
    );
    this.render();
  }

  disconnectedCallback() {
    if (this.unsubscribeLanguage) this.unsubscribeLanguage();
    if (this.unsubscribeChatMessageState) this.unsubscribeChatMessageState();
  }

  render() {
    const lang = window.store.languageStore.state.chat;

    const recipientIdIsDefined =
      window.store.chatMessageStore.get().recipientId.length > 0;

    const isBot = window.store.chatMessageStore.get().recipientId == "0";

    const hideWhenBot = isBot ? "hidden" : "";

    this.innerHTML = `
    <div class="h-full flex flex-col bg-gray-100 p-4 ${
      recipientIdIsDefined ? "" : "hidden"
    }">
      <h2 class="text-lg font-bold mb-2">${lang.tabs.users}</h2>

      <div id="messagesContainer" class="flex flex-col overflow-y-auto bg-white p-2 rounded shadow-inner"></div>

      <div class="mt-2 flex">
        <input id="chatInput" type="text" placeholder="${
          lang.placeholders.typeMessage
        }"
          class="flex-grow p-2 border rounded-l focus:outline-none focus:ring-2 focus:ring-blue-500 ${hideWhenBot}">
        <button id="chatSendButton" class="bg-blue-500 text-white px-4 py-2 rounded-r hover:bg-blue-600 ${hideWhenBot}">
          ${lang.buttons.sendMessage}
        </button>
      </div>
    </div>
  `;
    const msgContainer = document.querySelector(
      `#messagesContainer`
    ) as HTMLDivElement;

    const curMsgState = window.store.chatMessageStore.get();

    curMsgState.messages.forEach((msg) => {
      this.createAndAppend(msgContainer, msg);
    });

    msgContainer.scrollTop = msgContainer.scrollHeight;

    const input = this.querySelector("#chatInput") as HTMLInputElement;
    const chatSendButton = this.querySelector(
      "#chatSendButton"
    ) as HTMLButtonElement;
    chatSendButton.addEventListener("click", () => {
      ChatInterface.sendMessageToServer({
        type: "sentMessage",
        data: {
          authorId: window.store.userStore.get().details.id,
          recipientId: window.store.chatMessageStore.get().recipientId,
          date: getCurDateString(),
          message: sanitizeAndCleanInput(input.value),
        },
      });
    });
  }

  createAndAppend(container: HTMLDivElement, msg: ChatServiceTypes.Message) {
    const lang = window.store.languageStore.state.chat;
    const styleMsgOwner =
      window.store.userStore.get().details.id === msg.authorId
        ? "self-end border-green-300"
        : "self-start border-blue-300";
    const id = generateUniqueId();
    const isGameInvite = msg?.type === "sendGameInvite";
    const isTournamentStart = msg?.type === "startTournament";
    const isPlayerLeft = msg?.type === "playerLeft";
    const isMatchResult = msg?.type === "matchResult";
    let tmpMessage = msg.message;

    if (isTournamentStart || isPlayerLeft || isMatchResult || isGameInvite)
      tmpMessage = renderTournamentNotification(msg.message, msg.type!);

    const elem = createHtmlElementFromString(
      `
      <div class="flex flex-col ${styleMsgOwner} w-3/4 max-w-5xl mb-2">
        <span class="text-xs text-gray-400 ml-1">${msg.date}</span>
        <div class="w-full bg-white border-2 rounded-lg p-2 ${styleMsgOwner} overflow-x-auto">
          ${tmpMessage}
        </div>
        <button id="${id}_joinInviteBtn" class="text-white bg-blue-500 hover:bg-blue-600 py-1 px-3 rounded-lg">
                  ▶ ${lang.buttons.goToGameArea}
        </button>
      </div>
      `
    ) as HTMLDivElement;
    container.appendChild(elem);

    const joinBtn = document.querySelector(
      `#${id}_joinInviteBtn`
    ) as HTMLButtonElement;

    if (isMatchResult || isPlayerLeft){
      msg.message = tmpMessage!;
     // console.log("reconstructed Message: ", msg.message);
    }
    if (isGameInvite) {
      joinBtn.addEventListener("click", (event) => {
        event.stopPropagation();
        navigateToSite("matchmaking");
      });
    } else {
      joinBtn.classList.add("hidden");
    }
  }
}

customElements.define("chat-current", ChatCurrent);

export { ChatCurrent };
