import { generateUniqueId } from "transcendence";
import { transStore } from "../state/store";

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
         <button id="querynotifyBtn" class="w-full p-2 bg-red-600 rounded-lg hover:bg-red-700">
            🚪 notify
        </button>
    `;

        document.querySelector("#querynotifyBtn")?.addEventListener("click", () => {
      transStore.notificationStore.update([
        ...transStore.notificationStore.get(),
        {
          id: generateUniqueId(),
          message: `This is a notification!`,
        },
      ]);
    });
    
  }
}

customElements.define("test-page", TestPage);

export { TestPage };
