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
      this.innerHTML = `
          <!-- Right Panel: Chat Window -->
          <div class="h-full flex flex-col flex-grow bg-gray-100 p-4">
            <h2 class="text-lg font-bold mb-2">Chat</h2>
  
            <!-- Messages Container -->
            <div id="messagesContainer" class="flex-grow overflow-y-auto bg-white p-2 rounded shadow-inner">
              <div>HELLO WORLD</div>
            </div>
  
            <!-- Input Area -->
            <div class="mt-2 flex">
              <input id="chatInput" type="text" placeholder="Type a message..."
                class="flex-grow p-2 border rounded-l focus:outline-none focus:ring-2 focus:ring-blue-500">
              <button id="sendButton" class="bg-blue-500 text-white px-4 py-2 rounded-r hover:bg-blue-600">Send</button>
            </div>
          </div>
      `;
    }
  }
  
  customElements.define("chat-current", ChatCurrent);
  
  export { ChatCurrent };
  