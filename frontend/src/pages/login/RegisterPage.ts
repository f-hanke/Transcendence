import { AuthInterface } from "../../backendInterface/authInterface";
import { RegisterState } from "../../state/registerStateTypes";
import { createHtmlElementFromString, navigateToSite, sanitizeAndCleanInput } from "../../utils/utils";
import { transStore } from "../../state/store";

class RegisterPage extends HTMLElement {
  unsubscribeLanguage: null | (() => void);
  msgBox: HTMLDivElement;
  constructor() {
    super();
    this.msgBox = createHtmlElementFromString(`<div></div>`) as HTMLDivElement;
    this.unsubscribeLanguage = null;
  }

  connectedCallback() {
    this.render();
    this.unsubscribeLanguage = transStore.languageStore.subscribe(
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
    const lang = transStore.languageStore.state.register;
    // if user is logged in, redirect to landing page
    this.innerHTML = `
      <div class="flex flex-col justify-center items-center h-screen bg-gray-800 select-none">
        <form id="registerForm" class="p-6 rounded-lg shadow-lg w-96">
          <h2 class="text-xl font-bold mb-4 text-center">${lang.title}</h2>

          <label class="block mb-2 text-gray-700">${lang.email}</label>
          <input id="registerEmail" type="email" class="w-full p-2 rounded mb-4 bg-gray-700 focus:outline-none" required value=${
            transStore.registerStore.get().email
          }>

          <label class="block mb-2 text-gray-700">${lang.displayName}</label>
          <input id="registerDisplayName" type="text" class="w-full p-2 rounded mb-4 bg-gray-700 focus:outline-none" required value=${
            transStore.registerStore.get().displayName
          }>

          <label class="block mb-2 text-gray-700">${lang.password}</label>
          <input id="registerPassword" type="password" class="w-full p-2 rounded mb-4 bg-gray-700 focus:outline-none" required>

          <label class="block mb-2 text-gray-700">${lang.confirmPassword}</label>
          <input id="registerConfirmPassword" type="password" class="w-full p-2 rounded mb-4 bg-gray-700 focus:outline-none" required>
          <ul class="text-sm text-gray-400 list-disc pl-5 mb-4 space-y-1">
          <li>${lang.passwordRuleMinLength.replace("{n}", "8")}</li>
          <li>${lang.passwordRuleMaxLength.replace("{n}", "256")}</li>
          <li>${lang.passwordRuleUppercase}</li>
          <li>${lang.passwordRuleLowercase}</li>
          <li>${lang.passwordRuleDigit}</li>
          <li>${lang.passwordRuleSpecialChar}</li>
          </ul>
          <p id="errorMessage" class="text-red-500 text-sm mb-4"></p>
          <button type="submit" class="w-full bg-blue-500 p-2 rounded hover:bg-blue-600">
             ${lang.submit}
          </button>
        </form>
        <button id="registerGoToLogin" class="w-96 bg-blue-500 text-white p-2 my-8 rounded hover:bg-blue-600">
              ${lang.alreadyRegistered}
        </button>
        <!-- <button id="registerTestUserX" class="w-96 bg-blue-500 text-white p-2 my-8 rounded hover:bg-blue-600">
              ${lang.testUsers}
        </button> -->
      </div>
    `;

    (
      this.querySelector("#registerGoToLogin") as HTMLButtonElement
    ).addEventListener("click", () => {
      navigateToSite("/loginPage");
    });

    this.addUpdateStateEventListener("registerEmail", "email");
    this.addUpdateStateEventListener("registerDisplayName", "displayName");

    // this.addRegisterTestUser();

    this.msgBox = this.querySelector("#errorMessage") as HTMLDivElement;
  }

  addUpdateStateEventListener(elemId: string, stateKey: keyof RegisterState) {
    const inputElem = this.querySelector(`#${elemId}`) as HTMLInputElement;

    let debounceTimeout: number | null = null;

    inputElem.addEventListener("input", () => {
      if (debounceTimeout) clearTimeout(debounceTimeout);
      debounceTimeout = window.setTimeout(() => {
        transStore.registerStore.updateOneField(
          stateKey,
          sanitizeAndCleanInput(inputElem.value.trim())
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
    const lang = transStore.languageStore.state.register;
    const registerPassword = document.querySelector(
      "#registerPassword"
    ) as HTMLInputElement;
    const registerConfirmPassword = document.querySelector(
      "#registerConfirmPassword"
    ) as HTMLInputElement;

    if (registerPassword.value !== registerConfirmPassword.value) {
      this.msgBox.innerText = lang.errorPasswordMismatch;
      return;
    }

    const details = {
      email: transStore.registerStore.get().email,
      displayName: transStore.registerStore.get().displayName,
      password: registerPassword.value,
    };
    const res = await AuthInterface.registerClient(details);
    if (res.ok) {
      this.msgBox.innerText =lang.success;
      setTimeout(() => navigateToSite("/loginPage"), 1000);
    } else {
      this.msgBox.innerText = res.errorMessage as string;
    }
  }

  // async addRegisterTestUser() {
  //   const registerTestUserX = document.querySelector(
  //     "#registerTestUserX"
  //   ) as HTMLButtonElement;
  //   registerTestUserX.addEventListener("click", () => {
  //     colog(testUserConfig);
  //     testUserConfig.map(async (user) => {
  //       colog(user);
  //       const res = await AuthInterface.registerClient(user);
  //       colog(`${user.displayName}`);
  //       colog(res);
  //     });
  //   });
  // }
}

customElements.define("register-page", RegisterPage);

export { RegisterPage };
