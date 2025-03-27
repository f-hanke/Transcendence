import { colog } from "transcendence";
import { createHtmlElementFromString, navigateToSite } from "../utils/utils";

class TestPage extends HTMLElement {
  constructor() {
    super();
  }

  connectedCallback() {
    const modal = createHtmlElementFromString(`<central-modal>
      <h2 class="text-xl font-bold">Confirm Action</h2>
      <p>Are you sure you want to proceed?</p>
    </central-modal>`);
    this.appendChild(modal);
    colog(modal);
    colog(this);

    this.innerHTML = `
      <central-modal>
        HELLO WORLD!
        <h2 class="text-xl font-bold">Confirm Action</h2>
        <!-- <p>Are you sure you want to proceed?</p> -->
      </central-modal>
    `;
    // this.render();
  }

  disconnectedCallback() {}

  render() {
    this.innerHTML = `
      <central-modal>
        HELLO WORLD!
        <h2 class="text-xl font-bold">Confirm Action</h2>
        <p>Are you sure you want to proceed?</p>
      </central-modal>
    `;
    // this.innerHTML = `
    // <div class="bg-black h-full w-full">

    // </div>
    // `;
  }
}

customElements.define("test-page", TestPage);

export { TestPage };
