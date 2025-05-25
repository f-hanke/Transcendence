class UserSettingsOther extends HTMLElement {

  constructor() {
    super();
  }

  connectedCallback() {
    this.render();
  }

  disconnectedCallback() {
  }

  render() {
    this.innerHTML = `<user-settings></user-settings>`
  }
}

customElements.define("user-settings-other", UserSettingsOther);

export { UserSettingsOther };
