class AboutPage extends HTMLElement {
  connectedCallback() {
    this.innerHTML = `<h1>About Page</h1><p>Learn more about us here.</p>`;
  }
}
customElements.define("about-page", AboutPage);
