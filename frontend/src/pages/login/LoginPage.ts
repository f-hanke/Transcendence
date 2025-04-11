import { AuthServiceTypes, testUserConfig } from "transcendence";
import { navigateToSite } from "../../utils/utils";
import { AuthInterface } from "../../backendInterface/authInterface";

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
    // if user is logged in, redirect to landing page
    this.innerHTML = `
        <div class="bg-gray-800 h-screen flex flex-col justify-center items-center select-none">
          <div class="p-8 rounded-lg shadow-lg w-96">
            <h2 class="text-2xl font-bold text-center mb-6">Login to Pong</h2>
            <form id="loginForm" class="space-y-4">
            <div>
                <label for="username" class="block font-medium">Email</label>
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

          <button id="loginGoToRegister" class="w-96 bg-blue-500 text-white p-2 my-8 rounded hover:bg-blue-600">
            Not registered?
          </button>

          ${testUserConfig
            .map((user, index) => {
              return `
            <button id="loginTestUser${index}" class="w-96 bg-blue-500 text-white p-2 rounded hover:bg-blue-600 my-1">
              Login as test_user_${index}
            </button>
            `;
            })
            .join("")}
        </div>
        `;

    (
      this.querySelector("#loginGoToRegister") as HTMLButtonElement
    ).addEventListener("click", () => {
      navigateToSite("/registerPage");
    });

    document
      .querySelector("#loginForm")
      ?.addEventListener("submit", function (event) {
        event.preventDefault();
        console.log("Form Submitted");
        alert("Form Submitted");
      });

    this.addTestUserLogin();
  }

  addTestUserLogin() {
    testUserConfig.map(async (user, i) => {
      const button = document.querySelector(
        `#loginTestUser${i}`
      ) as HTMLButtonElement;
      button.addEventListener("click", () => {
        AuthInterface.login(user);
      });
    });
  }
}

customElements.define("login-page", LoginPage);

export { LoginPage };
