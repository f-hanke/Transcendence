
import styles from "../../index.css?inline";

class CentralModalButtons extends HTMLElement {
  unsubscribeLanguage: null | (() => void);
  okCallback: (() => void) | null = null;
  cancelCallback: (() => void) | null = null;
  shadow: ShadowRoot;
  constructor() {
    super();
    this.unsubscribeLanguage = null;
    this.shadow = this.attachShadow({ mode: "open" });
    const style = document.createElement("style");
    style.textContent = styles;
    const modalWrapper = document.createElement("div");
    modalWrapper.innerHTML = `
    <div id="modal" class="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center">
      <div id="modalContent" class="bg-white p-6 rounded-lg shadow-lg w-80 text-center">
        <slot>DEFAULT SLOT MESSAGE</slot>
        <div class="mt-4 flex justify-between">
          <button id="cancelBtn" class="px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600">Cancel</button>
          <button id="okBtn" class="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600">OK</button>
        </div>
      </div>
    </div>
  `;
  this.shadow.appendChild(style);
  this.shadow.appendChild(modalWrapper);
  }

  connectedCallback() {
    // this.unsubscribeLanguage = transStore.languageStore.subscribe(
    //   this.render.bind(this)
    // );
    
    // this.render();
  }

  disconnectedCallback() {
    if (this.unsubscribeLanguage) this.unsubscribeLanguage();
  }

  open() {
    this.style.display = "flex";
  }

  close() {
    this.style.display = "none";
  }

  render() {
    // this.innerHTML = `
    //     <div id="modal" class="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center">
    //       <div id="modalContent" class="bg-white p-6 rounded-lg shadow-lg w-80 text-center">
    //         <slot></slot>
    //         <div class="mt-4 flex justify-between">
    //           <button id="cancelBtn" class="px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600">Cancel</button>
    //           <button id="okBtn" class="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600">OK</button>
    //         </div>
    //       </div>
    //     </div>
    //   `;

    this.querySelector("#okBtn")?.addEventListener("click", () => {
      if (this.okCallback) this.okCallback();
      this.close();
    });

    this.querySelector("#cancelBtn")?.addEventListener("click", () => {
      if (this.cancelCallback) this.cancelCallback();
      this.close();
    });
  }
}

customElements.define("central-modal-buttons", CentralModalButtons);

export { CentralModalButtons };
