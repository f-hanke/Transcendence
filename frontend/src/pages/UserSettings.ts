import { isDefined } from "transcendence";
import { UserState } from "../state/userStateTypes";
import { convertToBase64 } from "../utils/utils";

class UserSettings extends HTMLElement {
  unsubscribe: null | (() => void);
  unsubscribeLanguage: null | (() => void);
  updatedState: Pick<UserState, "displayName" | "email" | "image">;
  constructor() {
    super();
    this.unsubscribe = null;
    this.unsubscribeLanguage = null;
    this.updatedState = {
      displayName: window.store.userStore.get().displayName,
      email: window.store.userStore.get().email,
      image: window.store.userStore.get().image,
    };
  }

  connectedCallback() {
    this.render();
    this.unsubscribe = window.store.userStore.subscribe(this.render.bind(this));
    this.unsubscribeLanguage = window.store.languageStore.subscribe(
      this.render.bind(this)
    );
  }

  disconnectedCallback() {
    if (this.unsubscribe) this.unsubscribe();
    if (this.unsubscribeLanguage) this.unsubscribeLanguage();
  }

  render() {
    this.innerHTML = `
      <div class="p-4 w-full h-full mx-auto bg-gray-800 text-white rounded-lg shadow-md">
        <h2 class="text-lg font-semibold mb-4">${
          window.store.languageStore.state.userSettings.userSettings
        }</h2>

        <!-- Profile Picture (Clickable) -->
        <div class="flex flex-col items-center mb-4">
          <label for="imageUpload" class="cursor-pointer">
            <img id="profileImage" src="${window.store.userStore.get().image}" 
              class="w-24 h-24 rounded-full border border-gray-600 hover:opacity-80 transition duration-300" 
              title="Click to change profile picture"/>
          </label>
          <input type="file" id="imageUpload" class="hidden" accept="image/*">
        </div>

        <!-- Display Name -->
        <label class="block text-sm">${
          window.store.languageStore.state.userSettings.displayName
        }</label>
        <input type="text" id="displayName" value="${
          window.store.userStore.get().displayName
        }" class="w-full p-2 mb-3 rounded bg-gray-700 text-white border border-gray-600">

        <!-- Email -->
        <label class="block text-sm">${
          window.store.languageStore.state.userSettings.email
        }</label>
        <input type="email" id="email" value="${
          window.store.userStore.get().email
        }" class="w-full p-2 mb-3 rounded bg-gray-700 text-white border border-gray-600">

        <!-- Save Button -->
        <button id="saveBtn" class="w-full p-2 bg-blue-600 rounded-lg hover:bg-blue-700">${
          window.store.languageStore.state.userSettings.save
        }</button>
      </div>
    `;

    this.querySelector("#profileImage")?.addEventListener("click", (event) => {
      event.preventDefault();
      (this.querySelector("#imageUpload") as HTMLLabelElement).click();
    });

    // validate user input on the backend

    document
      .querySelector("#saveBtn")
      ?.addEventListener("click", async (event) => {
        const newImage = (
          document.querySelector("#imageUpload") as HTMLInputElement
        ).files?.[0];
        const newEmail = (document.querySelector("#email") as HTMLInputElement)
          .value;
        const newDisplayName = (
          document.querySelector("#displayName") as HTMLInputElement
        ).value;
        if (isDefined(newImage)) {
          this.updatedState.image = await convertToBase64(newImage);
          // (document.querySelector("#profileImage") as HTMLImageElement).src =
          //   this.updatedState.image;
        }
        this.updatedState.email = newEmail;
        this.updatedState.displayName = newDisplayName;
        window.store.userStore.updateUserSettings(this.updatedState);
      });
  }
}

// addEventListeners() {
//   // Handle Profile Picture Upload
//   this.querySelector("#imageUpload")?.addEventListener("change", async (event) => {
//     const file = (event.target as HTMLInputElement).files?.[0];
//     if (file) {
//       const base64 = await this.convertToBase64(file);
//       this.userState.image = base64;
//       this.querySelector("#profileImage")!.setAttribute("src", base64);
//     }
//   });

customElements.define("user-settings", UserSettings);

export { UserSettings };
