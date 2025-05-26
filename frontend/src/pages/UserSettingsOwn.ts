class UserSettingsOwn extends HTMLElement {

  constructor() {
    super();
  }

  connectedCallback() {
    window.store.userStore.updateSetOtherUserId(null, false);
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
