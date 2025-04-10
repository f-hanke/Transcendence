import { AuthInterface } from "../../backendInterface/authInterface";
import { RegisterState } from "../../state/registerStateTypes";
import { navigateToSite } from "../../utils/utils";

class RegisterPage extends HTMLElement {
  unsubscribeLanguage: null | (() => void);

  constructor() {
    super();
    this.unsubscribeLanguage = null;
  }

  connectedCallback() {
    this.render();
    this.unsubscribeLanguage = window.store.languageStore.subscribe(
      this.render.bind(this)
    );
    document
      .querySelector("#registerForm")
      ?.addEventListener("submit", (e) => this.handleSubmit(e));
  }

  disconnectedCallback() {
    if (this.unsubscribeLanguage) this.unsubscribeLanguage();
    document
      .querySelector("#registerForm")
      ?.removeEventListener("submit", this.handleSubmit);
  }

  render() {
    // if user is logged in, redirect to landing page
    this.innerHTML = `
      <div class="flex flex-col justify-center items-center h-screen bg-gray-800 select-none">
        <form id="registerForm" class="p-6 rounded-lg shadow-lg w-96">
          <h2 class="text-xl font-bold mb-4 text-center">Register</h2>

          <label class="block mb-2 text-gray-700">Email</label>
          <input id="registerEmail" type="email" class="w-full p-2 rounded mb-4 bg-gray-700 focus:outline-none" required value=${
            window.store.registerStore.get().email
          }>

          <label class="block mb-2 text-gray-700">Display Name</label>
          <input id="registerDisplayName" type="text" class="w-full p-2 rounded mb-4 bg-gray-700 focus:outline-none" required value=${
            window.store.registerStore.get().displayName
          }>

          <label class="block mb-2 text-gray-700">Password</label>
          <input id="registerPassword" type="password" class="w-full p-2 rounded mb-4 bg-gray-700 focus:outline-none" required>

          <label class="block mb-2 text-gray-700">Confirm Password</label>
          <input id="registerConfirmPassword" type="password" class="w-full p-2 rounded mb-4 bg-gray-700 focus:outline-none" required>

          <p id="errorMessage" class="text-red-500 text-sm mb-4"></p>
          <button type="submit" class="w-full bg-blue-500 p-2 rounded hover:bg-blue-600">
            Register
          </button>
        </form>
        <button id="registerGoToLogin" class="w-96 bg-blue-500 text-white p-2 my-8 rounded hover:bg-blue-600">
              Already registered?
        </button>
      </div>
    `;

    (
      this.querySelector("#registerGoToLogin") as HTMLButtonElement
    ).addEventListener("click", () => {
      navigateToSite("/loginPage");
    });

    this.addUpdateStateEventListener("registerEmail", "email");
    this.addUpdateStateEventListener("registerDisplayName", "displayName");
  }

  addUpdateStateEventListener(elemId: string, stateKey: keyof RegisterState) {
    const inputElem = this.querySelector(`#${elemId}`) as HTMLInputElement;

    let debounceTimeout: number | null = null;

    inputElem.addEventListener("input", (event) => {
      if (debounceTimeout) clearTimeout(debounceTimeout);
      debounceTimeout = window.setTimeout(() => {
        window.store.registerStore.updateOneField(
          stateKey,
          inputElem.value.trim()
        );
      }, 500);
    });
    // inputElem.addEventListener("focus", () => {
    //   const length = inputElem.value.length;
    //   inputElem.setSelectionRange(length, length);
    // });
    // inputElem.focus();
  }

  async handleSubmit(event: Event) {
    event.preventDefault();
    const errorMessage = document.querySelector(
      "#registerErrorMessage"
    ) as HTMLParagraphElement;
    const registerPassword = document.querySelector(
      "#registerPassword"
    ) as HTMLInputElement;
    const registerConfirmPassword = document.querySelector(
      "#registerConfirmPassword"
    ) as HTMLInputElement;
    const details = {
      email: window.store.registerStore.get().email,
      displayName: window.store.registerStore.get().displayName,
      password: registerPassword.value,
    }
    window.colog("SUBMITTED THE FOLLOWING STATE");
    window.colog(details);
    const res = await AuthInterface.registerClient(details);
    window.brepo(res);
  }
}

customElements.define("register-page", RegisterPage);

export { RegisterPage };
