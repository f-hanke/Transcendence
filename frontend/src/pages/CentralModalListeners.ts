import { isDefined } from "transcendence";
import styles from "../../index.css?inline";
import { AllKeyboardKeyCodes } from "../utils/keycodesTypes";
import { createHtmlElementFromString } from "../utils/utils";
import { KeyDownCallback } from "../state/modalStateTypes";

class CentralModalListeners extends HTMLElement {
  unsubscribe: null | (() => void);
  unsubscribeLanguage: null | (() => void);
  constructor() {
    super();
    this.unsubscribeLanguage = null;
    this.unsubscribe = null;
    this.innerHTML = `<div class="hidden"></div>`;
    this.handleKeyDown = this.handleKeyDown.bind(this);
  }

  connectedCallback() {
    this.unsubscribe = window.store.modalStore.subscribe(
      this.render.bind(this)
    );
    this.render();
    document.addEventListener("keydown", this.handleKeyDown);
  }

  disconnectedCallback() {
    if (this.unsubscribe) this.unsubscribe();
    document.removeEventListener("keydown", this.handleKeyDown);
  }

  render() {
    const state = window.store.modalStore.get();
    this.innerHTML = `
      <div id="modal" class="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center
      ${state.open ? "" : "hidden"}">
        <div id="modalContent" class="bg-white p-6 rounded-lg shadow-lg w-80 text-center">
          ${window.store.modalStore.get().content.map((line) => {
            return `<p>${line}</p>`;
          })}
        </div>
      </div>
    `;
  }

  handleKeyDown(event: KeyboardEvent) {
    const validKeyCode = event.code as AllKeyboardKeyCodes;
    if (isDefined(window.store.modalStore.get().keyDownCallback[validKeyCode])) {
      (window.store.modalStore.get().keyDownCallback[validKeyCode] as KeyDownCallback)() ; 
      window.store.modalStore.reset();
      window.store.modalStore.updateSetClosed();
    }
  }
}

customElements.define("central-modal-listeners", CentralModalListeners);

export { CentralModalListeners };
