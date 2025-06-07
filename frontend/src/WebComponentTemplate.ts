import { transStore } from "./state/store";

class WebComponentTemplate extends HTMLElement {
  unsubscribeLanguage: null | (() => void);

  constructor() {
    super();
    this.unsubscribeLanguage = null;
  }

  connectedCallback() {
    this.unsubscribeLanguage = transStore.languageStore.subscribe(
      this.render.bind(this)
    );
  }

  disconnectedCallback() {
    if (this.unsubscribeLanguage) this.unsubscribeLanguage();
  }

  render() {}
}

customElements.define("webcomponent-template", WebComponentTemplate);

export { WebComponentTemplate };
