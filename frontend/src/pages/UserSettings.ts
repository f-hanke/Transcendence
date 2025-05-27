import { isDefined } from "transcendence";
import { EditableFields, UserState } from "../state/userStateTypes";
import {
  createHtmlElementFromString,
  fileToBufferLike,
  getImgSrcFromBuffer,
  sanitizeAndCleanInput,
} from "../utils/utils";
import { generateUniqueId } from "transcendence";
import { UserInterface } from "../backendInterface/userInterface";

class UserSettings extends HTMLElement {
  unsubscribe: null | (() => void);
  unsubscribeLanguage: null | (() => void);
  updatedState: Pick<UserState["details"], "displayName" | "email" | "image">;
  constructor() {
    super();
    this.unsubscribe = null;
    this.unsubscribeLanguage = null;
    this.updatedState = {
      displayName: window.store.userStore.get().details.displayName,
      email: window.store.userStore.get().details.email,
      image: window.store.userStore.get().details.image,
    };
  }

  connectedCallback() {
    this.render();
    this.unsubscribe = window.store.userStore.subscribe(this.render.bind(this));
    this.unsubscribeLanguage = window.store.languageStore.subscribe(
      this.render.bind(this)
    );
    const userId = window.store.userStore.get().details.otherUserId ?? window.store.userStore.get().details.id;
    UserInterface.getAllUserDetails(userId, true);
    UserInterface.getMatches(userId, false);
    UserInterface.getTournaments(userId);
  }

  disconnectedCallback() {
    if (this.unsubscribe) this.unsubscribe();
    if (this.unsubscribeLanguage) this.unsubscribeLanguage();
  }

  render() {
    const ownSettingsPage = window.store.userStore.get().details.otherUserId === null;

    this.innerHTML = `
      <div class="p-4 w-full h-full mx-auto bg-gray-800 text-white rounded-lg shadow-md">
        <h2 class="text-lg font-semibold mb-4">${window.store.languageStore.state.userSettings.userSettings}</h2>
        <div id="inputEditContainer"></div>

        <div class="bg-gray-800" id="userFriends"></div>
        <div class="bg-gray-800" id="userMatchHistory"></div>
      </div>
    `;

  const guidelines = window.store.languageStore.state.register;
  const pwGuidlines = createHtmlElementFromString(`
    <ul class="text-sm text-gray-400 list-disc pl-5 mb-4 space-y-1">
      <li>${guidelines.passwordRuleMinLength}</li>
      <li>${guidelines.passwordRuleMaxLength}</li>
      <li>${guidelines.passwordRuleUppercase}</li>
      <li>${guidelines.passwordRuleLowercase}</li>
      <li>${guidelines.passwordRuleDigit}</li>
      <li>${guidelines.passwordRuleSpecialChar}</li>
    </ul>
  `);

    // (this.querySelector("#userFriends") as HTMLDivElement).innerHTML =
    //   this.renderFriends();
    (this.querySelector("#userMatchHistory") as HTMLDivElement).innerHTML =
      this.renderMatchHistory();

    const inputEditContainer = this.querySelector(
      "#inputEditContainer"
    ) as HTMLDivElement;

    inputEditContainer.appendChild(this.renderProfileImage(ownSettingsPage));

    inputEditContainer.appendChild(
      this.renderOneInput(
        "displayName",
        window.store.languageStore.state.userSettings.displayName,
        this.saveDisplayName,
        ownSettingsPage
      )
    );
    inputEditContainer.appendChild(
      this.renderOneInput(
        "email",
        window.store.languageStore.state.userSettings.email,
        this.saveEmail,
        ownSettingsPage
      )
    );

    if (ownSettingsPage) {
      inputEditContainer.appendChild(
        this.renderOneInput(
          "password",
          window.store.languageStore.state.userSettings.password,
          this.savePassword,
          ownSettingsPage
        )
      );
      inputEditContainer.appendChild(pwGuidlines);
    }
  }

    //LEO change all the hard coded text
  renderProfileImage(ownSettingsPage: boolean) {
    const classWhenOwnSettings = ownSettingsPage ?
    "cursor-pointer hover:opacity-80 transition duration-300"
    : ""
    const imageToRender =
      window.store.userStore.get().editState.image ??
      window.store.userStore.get().details.image;
    const htmlElem = createHtmlElementFromString(`
    <div>
      <div class="flex gap-2">
      <label class="block text-sm">${window.store.languageStore.state.register.profilePicture}</label>
        <button id="saveBtnEditImage" title=${window.store.languageStore.state.register.save}>
          💾
        </button>
        <button id="resetBtnEditImage" title=${window.store.languageStore.state.register.reset}>
          🔄
        </button>
      </div>
        <div class="flex flex-col mb-4">
            <img id="profileImage" src="${getImgSrcFromBuffer(imageToRender)}"
              class=" w-full max-w-xl border border-gray-600  ${classWhenOwnSettings}"
              title="${window.store.languageStore.state.register.clickToChangeProfilePicture}"
          <input type="file" id="imageUpload" class="hidden"
          accept="image/png, image/jpeg">
      </div>
    </div>
      `);

    const saveBtn = htmlElem.querySelector(
      `#saveBtnEditImage`
    ) as HTMLButtonElement;
    const resetBtn = htmlElem.querySelector(
      `#resetBtnEditImage`
    ) as HTMLButtonElement;

    if (ownSettingsPage) {
      if (!isDefined(window.store.userStore.get().editState.image)) {
        saveBtn.classList.add("hidden");
        resetBtn.classList.add("hidden");
      }

      resetBtn.addEventListener("click", () => {
        const newState = {} as Partial<UserState["editState"]>;
        newState.image = null;
        window.store.userStore.updateSetEditState(newState);
      });

      saveBtn.addEventListener("click", async () => {
        const newImage = window.store.userStore.get().editState.image;
        if (isDefined(newImage)) {
          const res = await UserInterface.updateUserImage({
            image: newImage,
          });
          if (res.ok) {
            window.store.notificationStore.updateAddNotification({
              id: generateUniqueId(),
              message: window.store.languageStore.state.register.imageUpdateSuccess,
            });
            window.store.userStore.updateUserImage(newImage);
          } else {
            window.store.notificationStore.updateAddNotification({
              id: generateUniqueId(),
             message: `${window.store.languageStore.state.register.imageUpdateFail} ${res.errorMessage}`, //LEO
            });
          }
        }
        const newState = {} as Partial<UserState["editState"]>;
        newState["image"] = null;
        window.store.userStore.updateSetEditState(newState);
      });

      const profileImage = htmlElem.querySelector(
        "#profileImage"
      ) as HTMLImageElement;

      profileImage.addEventListener("click", (event) => {
        event.preventDefault();
        (this.querySelector("#imageUpload") as HTMLLabelElement).click();
      });

      htmlElem
        .querySelector("#imageUpload")
        ?.addEventListener("change", async function (event) {
          const maxFileSize = 1024 * 1024 * 4;
          const input = event.target as HTMLInputElement;
          // to do, only allow certain file extensions
          if (!input || !input.files || input.files.length === 0) return;
          const file = input.files[0];
          if (file.size > maxFileSize) {
            window.store.notificationStore.updateAddNotification({
              id: generateUniqueId(),
              message: window.store.languageStore.state.register.fileTooBig,
            });
            return;
          }
          const extension = file.name.split(".").pop()?.toLowerCase();
          if (!extension || !["jpg", "jpeg", "png"].includes(extension)) {
            window.store.notificationStore.updateAddNotification({
              id: generateUniqueId(),
              message: window.store.languageStore.state.register.invalidFileFormat,
            });
            return;
          }
          const fileAsBufferLike = await fileToBufferLike(file);
          window.store.userStore.updateSetEditState({
            image: fileAsBufferLike,
          });
        });
    } else {
      saveBtn.classList.add("hidden");
      resetBtn.classList.add("hidden");
    }

    return htmlElem;
  }

  async saveEmail() {
    if (isDefined(window.store.userStore.get().editState.email)) {
      const res = await UserInterface.updateUserEmail({
        email: window.store.userStore.get().editState.email as string,
      });
      if (res.ok) {
        window.store.notificationStore.updateAddNotification({
          id: generateUniqueId(),
          message: window.store.languageStore.state.register.emailUpdateSuccess,
        });
        window.store.userStore.updateUserSettings({
          email: window.store.userStore.get().editState.email as string,
        });
        const newState = {} as Partial<UserState["editState"]>;
        newState["displayName"] = undefined;
        window.store.userStore.updateSetEditState(newState);
      } else {
        window.store.notificationStore.updateAddNotification({
          id: generateUniqueId(),
          message: `${window.store.languageStore.state.register.emailUpdateFail} ${res.errorMessage}`,
        });
      }
    }
  }

  async savePassword() {
    if (isDefined(window.store.userStore.get().editState.password)) {
      const res = await UserInterface.updateUserPassword({
        password: window.store.userStore.get().editState.password as string,
      });
      if (res.ok) {
        window.store.notificationStore.updateAddNotification({
          id: generateUniqueId(),
          message: window.store.languageStore.state.register.passwordUpdateSuccess,
        });
        const newState = {} as Partial<UserState["editState"]>;
        newState["displayName"] = undefined;
        window.store.userStore.updateSetEditState(newState);
      } else {
        window.store.notificationStore.updateAddNotification({
          id: generateUniqueId(),
          message: `${window.store.languageStore.state.register.passwordUpdateFail} ${res.errorMessage}`,
        });
      }
    }
  }

  async saveDisplayName() {
    if (isDefined(window.store.userStore.get().editState.displayName)) {
      const res = await UserInterface.updateDisplayName({
        displayName: window.store.userStore.get().editState
          .displayName as string,
      });
      if (res.ok) {
        window.store.notificationStore.updateAddNotification({
          id: generateUniqueId(),
          message: window.store.languageStore.state.register.displayNameUpdateSuccess,
        });
        window.store.userStore.updateUserSettings({
          displayName: window.store.userStore.get().editState
            .displayName as string,
        });
        const newState = {} as Partial<UserState["editState"]>;
        newState["displayName"] = undefined;
        window.store.userStore.updateSetEditState(newState);
      } else {
        window.store.notificationStore.updateAddNotification({
          id: generateUniqueId(),
          message: `${window.store.languageStore.state.register.displayNameUpdateFail} ${res.errorMessage}`,
        });
      }
    }
  }

  renderOneInput(
    which: keyof EditableFields,
    label: string,
    saveFunc: () => {},
    ownSettingsPage: boolean
  ) {
    const htmlElem = createHtmlElementFromString(`
    <div>
      <div class="flex gap-2">
      <label class="block text-sm">${label}</label>
        <button id="saveBtnEdit${which}" title=${window.store.languageStore.state.register.save}>
          💾
        </button>
        <button id="resetBtnEdit${which}" title=${window.store.languageStore.state.register.save}>
          🔄
        </button>
      </div>
        <input type="text" id="input${which}" value="${
      window.store.userStore.get().editState[which] ??
      window.store.userStore.get().details[which]
    }" class="w-full p-2 mb-3 rounded bg-gray-700 text-white border border-gray-600 ${ownSettingsPage ? "" : "pointer-events-none select-none cursor-default"}"
    ${ownSettingsPage ?  "": "readonly"}
    ${ownSettingsPage ? "" : 'onfocus="this.blur();"'}
    >
      </div>
    `);

    const saveBtn = htmlElem.querySelector(
      `#saveBtnEdit${which}`
    ) as HTMLButtonElement;
    const resetBtn = htmlElem.querySelector(
      `#resetBtnEdit${which}`
    ) as HTMLButtonElement;

    if (ownSettingsPage) {
      if (!isDefined(window.store.userStore.get().editState[which])) {
        saveBtn.classList.add("hidden");
        resetBtn.classList.add("hidden");
      }

      resetBtn.addEventListener("click", () => {
        const newState = {} as Partial<UserState["editState"]>;
        newState[which] = undefined;
        window.store.userStore.updateSetEditState(newState);
      });

      saveBtn.addEventListener("click", async () => {
        saveFunc();
      });

      const inputElem = htmlElem.querySelector(
        `#input${which}`
      ) as HTMLInputElement;
      let debounceTimeout: number | null = null;

      inputElem.addEventListener("input", () => {
        if (debounceTimeout) clearTimeout(debounceTimeout);
        debounceTimeout = window.setTimeout(() => {
          const newState = {} as EditableFields;
          newState[which] = sanitizeAndCleanInput(inputElem.value.trim());
          window.store.userStore.updateSetEditState(newState);
          window.setTimeout(() => {
            (
              document.querySelector(`#input${which}`) as HTMLInputElement
            ).focus();
          }, 0);
        }, 500);
      });
      inputElem.addEventListener("focus", () => {
        const length = inputElem.value.length;
        inputElem.setSelectionRange(length, length);
      });
    } else {
      saveBtn.classList.add("hidden");
      resetBtn.classList.add("hidden");
    }

    return htmlElem;
  }

  renderMatchHistory() {
    const matches = [
      {
        opponent: "Alice",
        result: "Win",
        score: "11–7",
        datetime: "2024-11-02 14:32",
        type: "Remote",
        tournament: true,
      },
      {
        opponent: "Bob",
        result: "Loss",
        score: "9–11",
        datetime: "2024-10-20 18:45",
        type: "localPvP",
        tournament: false,
      },
      {
        opponent: "AI",
        result: "Win",
        score: "15–13",
        datetime: "2024-09-12 09:12",
        type: "localPvAi",
        tournament: false,
      },
    ]; //LEO CHANGE THE WIN ??
    return `
    <div class="mt-6">
      <h3 class="text-md font-semibold mb-2">
  ${window.store.languageStore.state.register.matchHistory}
    </h3>
      <div class="space-y-2">
        ${matches
          .map(
            (match) => `
          <div class="p-3 bg-gray-700 rounded shadow text-sm">
            <div class="flex justify-between mb-1">
              <span class="font-semibold">${match.opponent}</span>
              <span class="${
                match.result === "Win" ? "text-green-400" : "text-red-400"
              }">${match.result}</span>
            </div>
            <div class="grid grid-cols-4 gap-4 text-gray-300 text-xs">
              <div class="truncate">${match.datetime}</div>
              <div class="truncate">${match.type}</div>
              <div class="truncate">${match.score}</div>
              <div class="truncate">${
                match.tournament ? `🏆 ${window.store.languageStore.state.register.tournament}` : ""}
              }</div>
            </div>
          </div>
        `
          )
          .join("")}
      </div>
    </div>
  `;
  }

  renderFriends() {
    return `
     <div class="mt-6">
        <h3 class="text-md font-semibold mb-2">
        ${window.store.languageStore.state.register.friends}
      </h3>
        <ul class="space-y-2">
          ${[
            { name: "Alice", online: true },
            { name: "Bob", online: false },
            { name: "Charlie", online: true },
          ]
            .map(
              (friend) => `
            <li class="flex items-center justify-between px-4 py-2 bg-gray-700 rounded">
              <span>${friend.name}</span>
            <span class="text-sm ${
              friend.online ? "text-green-400" : "text-gray-400"
            }">
              ${friend.online
                ? window.store.languageStore.state.chat.sections.online
                : window.store.languageStore.state.chat.sections.offline}
            </span>
            </li>
          `
            )
            .join("")}
        </ul>
      </div>
    `;
  }
}

customElements.define("user-settings", UserSettings);

export { UserSettings };
