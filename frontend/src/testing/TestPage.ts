import { exampleImage } from "./exampleImage";

class TestPage extends HTMLElement {
  constructor() {
    super();
  }

  connectedCallback() {
    this.render();
    const websocket = new WebSocket(`ws://localhost:3000?clientId=id_${Date.now()}`);
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
