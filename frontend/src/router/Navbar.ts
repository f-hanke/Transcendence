import { SupportedLanguages } from "../state/languageStateStore/languageStateTypes";

class Navbar extends HTMLElement {
  unsubscribeLanguage: null | (() => void);
  unsubscribe: null | (() => void);
  constructor() {
    super();
    this.unsubscribeLanguage = null;
    this.unsubscribe = null;
    // this.handleLanguageChange = this.handleLanguageChange.bind(this);
  }

  connectedCallback() {
    this.render();
    this.unsubscribeLanguage = window.store.languageStore.subscribe(() =>
      this.render()
    );
    this.unsubscribe = window.store.userStore.subscribe(() =>
      this.render()
    );
  }

  disconnectedCallback() {
    if (this.unsubscribeLanguage) this.unsubscribeLanguage();
    if (this.unsubscribe) this.unsubscribe();
  }

  render() {
    console.log("navabr rendered!");
    this.innerHTML = `
    <div class="h-full bg-gray-800 text-white shadow-lg flex flex-col">
      <div class="p-4 flex items-center space-x-3 border-b border-gray-700">
        <img src="${window.store.userStore.get().image}" alt="Profile" class="w-20 h-20 rounded-full" />
        <div>
          <a href="/profile" class="text-lg font-semibold hover:underline">${window.store.userStore.get().displayName}</a>
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
              <li><a href="/oneVOneLocal" class="block px-4 py-2 hover:bg-gray-600 rounded">${window.store.languageStore.state.navbar.oneV1local}</a></li>
              <li><a href="/matchmaking" class="block px-4 py-2 hover:bg-gray-600 rounded">${window.store.languageStore.state.navbar.oneV1remote}</a></li>
              <li><a href="/play/tournament" class="block px-4 py-2 hover:bg-gray-600 rounded">${window.store.languageStore.state.navbar.tournament}</a></li>
            </ul>
          </li>
          <li>
            <a href="/messages" class="block p-2 rounded-lg hover:bg-gray-700">✉️ ${window.store.languageStore.state.navbar.messages}</a>
          </li>
          <li>
            <a href="/settings" class="block p-2 rounded-lg hover:bg-gray-700">⚙️ ${window.store.languageStore.state.navbar.settings}</a>
          </li>
          <li>
            <a href="/testpage" class="block p-2 rounded-lg hover:bg-gray-700">⚙️ Testpage</a>
          </li>
        </ul>
      </nav>

      <div class="p-4 border-t border-gray-700">
        <label for="language-select" class="text-sm text-gray-300">Language</label>
        <select id="language-select" class="mt-2 p-2 w-full bg-gray-600 text-white rounded-md">
          <option value="en" ${window.store.languageStore.getSelectedLanguage() === 'en' ? 'selected' : ''}>English</option>
          <option value="de" ${window.store.languageStore.getSelectedLanguage() === 'de' ? 'selected' : ''}>Deutsch</option>
          <!-- Add more languages here -->
        </select>
      </div>

      <button id="querynotifyBtn" class="w-full p-2 bg-red-600 rounded-lg hover:bg-red-700">
            🚪 notify
        </button>
      <div class="p-4 border-t border-gray-700">
        <button class="w-full p-2 bg-red-600 rounded-lg hover:bg-red-700">🚪 ${window.store.languageStore.state.navbar.logout}</button>
      </div>
    </div>
  `;
    document.querySelector("#language-select")!.addEventListener("change", (event) => this.handleLanguageChange(event));
  }

  handleLanguageChange(event: Event) {
    const language = (event.target as HTMLSelectElement).value;
    window.store.languageStore.set(language as SupportedLanguages);
  }

}

customElements.define("nav-bar", Navbar);

export { Navbar };
