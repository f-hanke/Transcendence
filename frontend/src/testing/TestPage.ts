import { exampleImage } from "./exampleImage";

class TestPage extends HTMLElement {
  constructor() {
    super();
  }

  connectedCallback() {
    this.render();
  }

  disconnectedCallback() {

  }

  render() {
    this.innerHTML = `
    
    `
  }
}

customElements.define("test-page", TestPage);

export { TestPage };
