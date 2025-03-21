class TestPage extends HTMLElement {
  constructor() {
    super();
  }

  connectedCallback() {
    this.render();
  }

  disconnectedCallback() {

  }

  render() {
    this.innerHTML = `
      <match-item 
      host="HELLO WORLD!" 
      matchId="ID MATCH" 
      oponent="ENDGEGENER"
      renderJoin="1"></match-item>
    `
  }
}

customElements.define("test-page", TestPage);

export { TestPage };
