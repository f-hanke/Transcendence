import { createHtmlElementFromString } from "../utils/utils";
import { transStore } from "../state/store";

class NotificationModal extends HTMLElement {
  message: string;
  timeoutId: number | null;
  unsubscribe: null | (() => void);
  unsubscribeLanguage: null | (() => void);
  constructor() {
    super();
    this.message = "";
    this.timeoutId = null;
    this.unsubscribe = null;
    this.unsubscribeLanguage = null;
  }

  connectedCallback() {
    this.unsubscribe = transStore.notificationStore.subscribe(() =>
      this.render()
    );
    this.unsubscribeLanguage = transStore.languageStore.subscribe(
      this.render.bind(this)
    );
  }

  disconnectedCallback() {
    if (this.timeoutId) {
      clearTimeout(this.timeoutId);
    }
    if (this.unsubscribe) this.unsubscribe();
    if (this.unsubscribeLanguage) this.unsubscribeLanguage();
  }

  render() {
    // console.log("Notification rendered!");
    const notificationState = transStore.notificationStore.get();
    if (notificationState.length == 0) return;
    let notificationNode: HTMLElement;
    this.innerHTML = "";
    const div = createHtmlElementFromString(`<div class="fixed top-4 left-1/2 transform -translate-x-1/2 w-full max-w-md text-center z-50"></div>`);
    notificationState.forEach(({id, message}) => {
      notificationNode = this.createNotificationNode(id, message);
      div.appendChild(notificationNode);
      //   this.innerHTML += notificationHtml;
    });

    if (this.timeoutId) clearTimeout(this.timeoutId);

    this.timeoutId = window.setTimeout(() => {
      transStore.notificationStore.update([]);
      this.innerHTML = "";
      // notificationNode.remove();
      // let newState = notificationState.filter(([id2, msg]) => id2 !== id);
      // transStore.updateNotificationState(newState);
    }, 5000);
    this.appendChild(div);
  }

  createNotificationNode(id: string, message: string) {
    return createHtmlElementFromString(
    `
      <div id=${id} class="bg-gradient-to-r from-red-500 to-purple-600 m-2 p-4 rounded-lg shadow-xl border border-white/20">
        <div class="text-sm font-semibold text-white">${message}</div>
      </div>
    `
    );
  }
}

customElements.define("notification-modal", NotificationModal);

export { NotificationModal };
