import { generateUniqueId } from "transcendence";


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
      window.store.notificationStore.update([
        ...window.store.notificationStore.get(),
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
