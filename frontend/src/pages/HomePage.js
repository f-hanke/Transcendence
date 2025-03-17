class HomePage extends HTMLElement {
  connectedCallback() {
    this.innerHTML = `<h1>Home Page</h1><p>Welcome to our SPA!</p>`;
  }
}

customElements.define("home-page", HomePage);
