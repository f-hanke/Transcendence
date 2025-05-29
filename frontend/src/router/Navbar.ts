import { AuthInterface } from "../backendInterface/authInterface";
import { getImgSrcFromBuffer } from "../utils/utils";

class Navbar extends HTMLElement {
  unsubscribeLanguage: null | (() => void);
  unsubscribe: null | (() => void);
  constructor() {
    super();
    this.unsubscribeLanguage = null;
    this.unsubscribe = null;
  }

  connectedCallback() {
    this.render();
    this.unsubscribeLanguage = window.store.languageStore.subscribe(() =>
      this.render()
    );
    this.unsubscribe = window.store.userStore.subscribe(() => this.render());
  }

  disconnectedCallback() {
    if (this.unsubscribeLanguage) this.unsubscribeLanguage();
    if (this.unsubscribe) this.unsubscribe();
  }

  render() {
    this.innerHTML = `
    <div class="bg-gray-800 text-white shadow-lg flex flex-col">
      <div class="p-4 flex flex-col items-center space-x-3 border-b border-gray-700">
        <img src="${
          getImgSrcFromBuffer(window.store.userStore.get().details.image)
        }" alt="Profile" class="h-32 rounded-lg" />
        <div>
          <a href="/profile" class="text-lg font-semibold hover:underline">${
            window.store.userStore.get().details.displayName
          }</a>
        </div>
      </div>
      <nav class="flex-1 p-4 overflow-y-auto">
        <ul class="space-y-3">
          <li class="group relative">
            <a href="#" class="block p-2 rounded-lg hover:bg-gray-700 flex justify-between items-center">
              🎮 ${window.store.languageStore.state.navbar.play}
              <span class="group-hover:rotate-90 transition-transform duration-300">▶</span>
            </a>
            <!-- Submenu -->
            <ul class="relative left-0 w-full hidden group-hover:block bg-gray-700 rounded-lg space-y-1 p-2 transition-all duration-300 ease-in-out transform opacity-0 group-hover:opacity-100 group-hover:translate-y-2">
              <li><a href="/oneVOneLocal" class="block px-4 py-2 hover:bg-gray-600 rounded">${
                window.store.languageStore.state.navbar.oneV1local
              }</a></li>
              <li><a href="/matchmaking" class="block px-4 py-2 hover:bg-gray-600 rounded">${
                window.store.languageStore.state.navbar.oneV1remote
              }</a></li>
              <li><a href="/currentTournament" class="block px-4 py-2 hover:bg-gray-600 rounded">${
                window.store.languageStore.state.navbar.tournament
              }</a></li>
            </ul>
          </li>
          <li>
            <a href="/chat" class="block p-2 rounded-lg hover:bg-gray-700">✉️ ${
              window.store.languageStore.state.navbar.messages
            }</a>
          </li>
          <li>
            <a href="/userSettingsOwn" class="block p-2 rounded-lg hover:bg-gray-700">⚙️ ${
              window.store.languageStore.state.navbar.settings
            }</a>
          </li>
          <!-- <li>
            <a href="/testpage" class="block p-2 rounded-lg hover:bg-gray-700">⚙️ Testpage</a>
          </li> -->
          <!-- <li>
            <a href="/loginPage" class="block p-2 rounded-lg hover:bg-gray-700">⚙️ Login</a>
          </li>
          <li>
            <a href="/registerPage" class="block p-2 rounded-lg hover:bg-gray-700">⚙️ Register</a>
          </li> -->
          <!-- <li>${window.store.userStore.get().details.id}</li>
          <li>
            <input id="setIdInput" class="text-black" type="text">
            <button id="setIdButton">SET ID</button>
          </li> -->
        </ul>
      </nav>

      <!-- <button id="querynotifyBtn" class="w-full p-2 bg-red-600 rounded-lg hover:bg-red-700">
            🚪 notify
        </button> -->
      <div class="p-4 border-t border-gray-700">
        <button id="logoutBtn" class="w-full p-2 bg-red-600 rounded-lg hover:bg-red-700">🚪 ${
          window.store.languageStore.state.navbar.logout
        }</button>
      </div>
    </div>
  `;

    // document.querySelector("#querynotifyBtn")?.addEventListener("click", () => {
    //   window.store.notificationStore.update([
    //     ...window.store.notificationStore.get(),
    //     {
    //       id: generateUniqueId(),
    //       message: `This is a notification!`,
    //     },
    //   ]);
    // });

    // const inputId = document.querySelector("#setIdInput") as HTMLInputElement;
    // const btnSetId = document.querySelector(
    //   "#setIdButton"
    // ) as HTMLButtonElement;

    // btnSetId.addEventListener("click", () => {
    //   const idVal = inputId.value;
    //   sessionStorage.setItem("transTestId", idVal);
    // });

    const lopgoutBtn = document.querySelector(
      `#logoutBtn`
    ) as HTMLButtonElement;
    lopgoutBtn.addEventListener("click", () => {
      AuthInterface.logout();
    });
  }
}

customElements.define("nav-bar", Navbar);

export { Navbar };
