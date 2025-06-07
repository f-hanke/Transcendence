import { transStore } from "../state/store";

class UserSettingsOwn extends HTMLElement {

  constructor() {
    super();
  }

  connectedCallback() {
    transStore.userStore.updateSetOtherUserId(null, false);
    this.render();
    
  }

  disconnectedCallback() {
  }

  render() {
    this.innerHTML = `<user-settings></user-settings>`
  }
}

customElements.define("user-settings-own", UserSettingsOwn);

export { UserSettingsOwn };
