import { isDefined } from "transcendence";
import { EditableFields, UserState } from "../state/userStateTypes";
import {
  createHtmlElementFromString,
  sanitizeAndCleanInput,
} from "../utils/utils";

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
            <img id="profileImage" src="${
              window.store.userStore.get().details.image
            }" 
              class="cursor-pointer w-full max-w-xl border border-gray-600 hover:opacity-80 transition duration-300" 
              title="Click to change profile picture"/>
          <input type="file" id="imageUpload" class="hidden" accept="image/*">
        </div>
        <div id="inputEditContainer"></div>
        <div class="bg-gray-800" id="userFriends"></div>
        <div class="bg-gray-800" id="userMatchHistory"></div>
      </div>
    `;

    (this.querySelector("#userFriends") as HTMLDivElement).innerHTML =
      this.renderFriends();
    (this.querySelector("#userMatchHistory") as HTMLDivElement).innerHTML =
      this.renderMatchHistory();

    const inputEditContainer = this.querySelector(
      "#inputEditContainer"
    ) as HTMLDivElement;
    inputEditContainer.appendChild(
      this.renderOneInput(
        "displayName",
        window.store.languageStore.state.userSettings.displayName
      )
    );
    inputEditContainer.appendChild(
      this.renderOneInput(
        "email",
        window.store.languageStore.state.userSettings.email
      )
    );
    inputEditContainer.appendChild(
      this.renderOneInput(
        "password",
        window.store.languageStore.state.userSettings.password
      )
    );

    this.querySelector("#profileImage")?.addEventListener("click", (event) => {
      event.preventDefault();
      (this.querySelector("#imageUpload") as HTMLLabelElement).click();
    });
  }

  renderOneInput(which: keyof EditableFields, label: string) {
    const htmlElem = createHtmlElementFromString(`
    <div>
      <div class="flex gap-2">
      <label class="block text-sm">${label}</label>
        <button id="saveBtnEdit${which}" title="Save">
          💾
        </button>
        <button id="resetBtnEdit${which}" title="Reset">
          🔄 
        </button>
      </div>
        <input type="text" id="input${which}" value="${
      window.store.userStore.get().editState[which] ??
      window.store.userStore.get().details[which]
    }" class="w-full p-2 mb-3 rounded bg-gray-700 text-white border border-gray-600">
      </div>
    `);

    const saveBtn = htmlElem.querySelector(
      `#saveBtnEdit${which}`
    ) as HTMLButtonElement;
    const resetBtn = htmlElem.querySelector(
      `#resetBtnEdit${which}`
    ) as HTMLButtonElement;

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
      // const res = await UserInterface.updateDisplayName({
      //   displayName:  window.store.userStore.get().editState.displayName as string
      // });
      // colog("dipslayNameUpdate");
      // colog(res);
      const newState = {} as Partial<UserState["editState"]>;
      newState[which] = undefined;
      window.store.userStore.updateSetEditState(newState);
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
    ];
    return `
    <div class="mt-6">
      <h3 class="text-md font-semibold mb-2">Match History</h3>
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
                match.tournament ? "🏆 Tournament" : ""
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
        <h3 class="text-md font-semibold mb-2">Friends</h3>
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
              }">${friend.online ? "Online" : "Offline"}</span>
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
