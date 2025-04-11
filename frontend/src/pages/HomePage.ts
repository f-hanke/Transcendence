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
      <div class="text-red-700">THIS IS THE HOME PAGE!</div>
      <div>THIS IS THE LANDING PAGE!</div>
    `
  }

  disconnectedCallback() {
    if (this.unsubscribeLanguage) this.unsubscribeLanguage();
  }

  render() {}
}

customElements.define("home-page", HomePage);

export { HomePage };
