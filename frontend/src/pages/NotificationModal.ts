import { createHtmlElementFromString } from "../utils/utils";

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
    this.unsubscribe = window.store.notificationStore.subscribe(() =>
      this.render()
    );
    this.unsubscribeLanguage = window.store.languageStore.subscribe(
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
    const notificationState = window.store.notificationStore.get();
    if (notificationState.length == 0) return;
    let notificationNode: HTMLElement;
    this.innerHTML = "";
    const div = createHtmlElementFromString(`<div class="fixed top-0 w-full text-center"></div>`);
    notificationState.forEach(({id, message}) => {
      notificationNode = this.createNotificationNode(id, message);
      div.appendChild(notificationNode);
      //   this.innerHTML += notificationHtml;
    });

    if (this.timeoutId) clearTimeout(this.timeoutId);

    this.timeoutId = window.setTimeout(() => {
      window.store.notificationStore.update([]);
      this.innerHTML = "";
      // notificationNode.remove();
      // let newState = notificationState.filter(([id2, msg]) => id2 !== id);
      // window.store.updateNotificationState(newState);
    }, 5000);
    this.appendChild(div);
  }

  createNotificationNode(id: string, message: string) {
    return createHtmlElementFromString(
    `
      <div id=${id} class="bg-gray-400 m-2 p-4 rounded-md shadow-lg ">
        <div class="text-sm font-bold mb-4 text-white">${message}</div>
      </div>
    `
    );
  }
}

customElements.define("notification-modal", NotificationModal);

export { NotificationModal };
