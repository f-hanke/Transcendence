class NotificationModal extends HTMLElement {
  message: string;
  timeoutId: number | null;
  unsubscribe: null | (() => void);
  constructor() {
    super();
    this.message = "";
    this.timeoutId = null;
    this.unsubscribe = null;
  }

  connectedCallback() {
    this.unsubscribe = window.store.subscribe("notificationState", () =>
      this.render()
    );
  }

  disconnectedCallback() {
    if (this.timeoutId) {
      clearTimeout(this.timeoutId);
    }
    if (this.unsubscribe) this.unsubscribe();
  }

  render() {
    const notificationState = window.store.getNotificationState();
    if(notificationState.length == 0)
      return;
    let notificationNode: HTMLElement;
    this.innerHTML = "";
    const div = document.createElement("div");
    div.setAttribute("class", "fixed top-0 left-1/2");
    notificationState.forEach(([id, message], index) => {
      notificationNode = this.createNotificationNode(id, message);

      div.appendChild(notificationNode);

      //   this.innerHTML += notificationHtml;
    });

    if (this.timeoutId) clearTimeout(this.timeoutId);

    this.timeoutId = window.setTimeout(() => {
      window.store.updateNotificationState([]);
      this.innerHTML = "";
      // notificationNode.remove();
      // let newState = notificationState.filter(([id2, msg]) => id2 !== id);
      // window.store.updateNotificationState(newState);
    }, 2000);
    this.appendChild(div);
  }

  createNotificationNode(id: string, message: string) {
    const template = document.createElement("template");
    template.innerHTML = `
      <div id=${id} class="bg-white mx-auto p-4 rounded-md shadow-lg bg-gray-50">
        <div class="text-2xl font-bold text-indigo-500 mb-4">${message}</div>
      </div>
    `;
    // return template.content.cloneNode(true) as HTMLElement;
    return template.content.firstElementChild as HTMLElement;
  }
}

customElements.define("notification-modal", NotificationModal);

export { NotificationModal };
