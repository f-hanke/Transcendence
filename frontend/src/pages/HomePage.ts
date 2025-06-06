class HomePage extends HTMLElement {
  unsubscribeLanguage: null | (() => void);

  constructor() {
    super();
    this.unsubscribeLanguage = null;
  }

  connectedCallback() {
    this.unsubscribeLanguage = window.store.languageStore.subscribe(
      this.render.bind(this)
    );
    this.innerHTML = `
      <div class="text-red-700">Milo is the greatest</div>
      <div>M i l o</div>
    `
  }

  disconnectedCallback() {
    if (this.unsubscribeLanguage) this.unsubscribeLanguage();
  }

  render() {}
}

customElements.define("home-page", HomePage);

export { HomePage };
