import { ChatInterface } from "../../backendInterface/chatInterface";

class ChatLayout extends HTMLElement {
  unsubscribeLanguage: null | (() => void);

  constructor() {
    super();
    this.unsubscribeLanguage = null;
  }

  connectedCallback() {
    this.unsubscribeLanguage = window.store.languageStore.subscribe(
      this.render.bind(this)
    );
    // ChatInterface.connect();
    this.render();
  }

  disconnectedCallback() {
    if (this.unsubscribeLanguage) this.unsubscribeLanguage();
    // ChatInterface.disconnect();
  }

  render() {
    this.innerHTML = `
      <div class="flex h-full w-full">
        <chat-list></chat-list>
        <chat-current class="flex-grow"></chat-current>
      </div>
    `;
  }
}

customElements.define("chat-layout", ChatLayout);

export { ChatLayout };
