import { isDefined } from "transcendence";
import styles from "../../index.css?inline";
import { AllKeyboardKeyCodes } from "../utils/keycodesTypes";

type KeyDownCallback = () => void;
type KeyCallbackMap = Partial<Record<AllKeyboardKeyCodes, KeyDownCallback>>;

class CentralModalListeners extends HTMLElement {
  unsubscribeLanguage: null | (() => void);
  keyDownCallBack: KeyCallbackMap;
  shadow: ShadowRoot;
  ready: Promise<void>;
  _resolveReady!: ()=>void;

  constructor() {
    super();
    this.keyDownCallBack = {};
    this.unsubscribeLanguage = null;
    this.shadow = this.attachShadow({ mode: "open" });
    const style = document.createElement("style");
    style.textContent = styles;
    const modalWrapper = document.createElement("div");

    this.ready = new Promise<void>((resolve) => 
    {
      this._resolveReady = resolve;
    })

    modalWrapper.innerHTML = `
    <div id="modal" class="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center">
      <div id="modalContent" class="bg-white p-6 rounded-lg shadow-lg w-80 text-center">
        <slot>DEFAULT SLOT MESSAGE</slot>
      </div>
    </div>
  `;
    this.shadow.appendChild(style);
    this.shadow.appendChild(modalWrapper);
    this.handleKeyDown = this.handleKeyDown.bind(this);
  }

  connectedCallback() {
    document.addEventListener("keydown", this.handleKeyDown);
    this._resolveReady();
  }

  disconnectedCallback() {
    document.removeEventListener("keydown", this.handleKeyDown);
  }

  open() {
    this.style.display = "flex";
  }

  close() {
    this.style.display = "none";
  }

  setKeyListener(KeyCallbackMap: KeyCallbackMap) {
    this.keyDownCallBack = KeyCallbackMap;
  }

  handleKeyDown(event: KeyboardEvent) {
    const validKeyCode = event.code as AllKeyboardKeyCodes;
    if (isDefined(this.keyDownCallBack[validKeyCode]))
    {
      this.keyDownCallBack[validKeyCode]();
      this.close();
    }
  }
}

customElements.define("central-modal-listeners", CentralModalListeners);

export { CentralModalListeners };
