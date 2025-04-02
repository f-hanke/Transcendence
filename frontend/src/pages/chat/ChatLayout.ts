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
    this.render();
  }

  disconnectedCallback() {
    if (this.unsubscribeLanguage) this.unsubscribeLanguage();
  }

  render() {
    this.innerHTML = `
      <div class="flex h-full w-full">
        <chat-list></chat-list>
        <chat-current></chat-current>
      </div>
    `;
  }
}

customElements.define("chat-layout", ChatLayout);

export { ChatLayout };
