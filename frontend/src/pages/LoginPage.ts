class LoginPage extends HTMLElement {
  unsubscribeLanguage: null | (() => void);
  constructor() {
    super();
    this.unsubscribeLanguage = null;
  }

  connectedCallback() {
    this.unsubscribeLanguage = window.store.languageStore.subscribe(
      this.render.bind(this)
    );
    this.render();
  }

  disconnectedCallback() {
    if (this.unsubscribeLanguage) this.unsubscribeLanguage();
  }

  render() {
    this.innerHTML = `
        <div class="bg-gray-800 h-screen flex justify-center items-center">
          <div class="p-8 rounded-lg shadow-lg">
            <h2 class="text-2xl font-bold text-center mb-6">Login to Pong</h2>
            <form id="loginForm" class="space-y-4">
            <div>
                <label for="username" class="block font-medium">Username</label>
                <input id="username" type="text" class="w-full p-2 rounded bg-gray-700 focus:outline-none" required>
            </div>

            <div>
                <label for="password" class="block font-medium">Password</label>
                <input id="password" type="password" class="w-full p-2 rounded bg-gray-700 focus:outline-none" required>
            </div>

            <button type="submit" class="w-full bg-blue-500 hover:bg-blue-600 p-2 rounded">
                Login
            </button>
            </form>
          </div>
        </div>
        `;

    document
      .querySelector("#loginForm")
      ?.addEventListener("submit", function (event) {
        event.preventDefault();
        console.log("Form Submitted");
        alert("Form Submitted");
      });
  }
}

customElements.define("login-page", LoginPage);

export { LoginPage };
