import { navigateToSite } from "../utils/utils";

class TestPage extends HTMLElement {
  constructor() {
    super();
  }

  connectedCallback() {
    this.render();
  }

  disconnectedCallback() {}

  render() {
    this.innerHTML = `
    <div class="bg-black h-full w-full">
      <!-- <match-score></match-score> -->
      <login-page class="bg-white"></login-page>
      <!-- <pong-table></pong-table> -->
    </div>

      <!-- <button id="navigateToBtn">TEST STUFF</button> -->
    `;

    // document.querySelector("#navigateToBtn")?.addEventListener("click", () => {
    //   navigateToSite("matchmaking");
    // });
  }
}

customElements.define("test-page", TestPage);

export { TestPage };
