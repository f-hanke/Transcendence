import { isDefined } from "transcendence";
import { AllKeyboardKeyCodes } from "../utils/keycodesTypes";
import { KeyDownCallback } from "../state/modalStateTypes";
import { transStore } from "../state/store";

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
    this.unsubscribe = transStore.modalStore.subscribe(
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
    const state = transStore.modalStore.get();
    this.innerHTML = `
      <div id="modal" class="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center
      ${state.open ? "" : "hidden"}">
        <div id="modalContent" class="bg-white p-6 rounded-lg shadow-lg w-80 text-center">
          ${transStore.modalStore.get().content.map((line) => {
            return `<p>${line}</p>`;
          })}
        </div>
      </div>
    `;
  }

  handleKeyDown(event: KeyboardEvent) {
    const validKeyCode = event.code as AllKeyboardKeyCodes;
    if (isDefined(transStore.modalStore.get().keyDownCallback[validKeyCode])) {
      (transStore.modalStore.get().keyDownCallback[validKeyCode] as KeyDownCallback)() ; 
      transStore.modalStore.reset();
      console.log("Closing modal Here!");
      transStore.modalStore.updateSetClosed();
    }
  }
}

customElements.define("central-modal-listeners", CentralModalListeners);

export { CentralModalListeners };
