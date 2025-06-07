import { transStore } from "../state/store";

class HomePage extends HTMLElement {
  unsubscribeLanguage: null | (() => void);

  constructor() {
    super();
    this.unsubscribeLanguage = null;
  }

  connectedCallback() {
    this.unsubscribeLanguage = transStore.languageStore.subscribe(
      this.render.bind(this)
    );
    this.innerHTML = `

    `
  }

  disconnectedCallback() {
    if (this.unsubscribeLanguage) this.unsubscribeLanguage();
  }

  render() {}
}

customElements.define("home-page", HomePage);

export { HomePage };
