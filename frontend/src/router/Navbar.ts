class Navbar extends HTMLElement {
    constructor() {
      super();
    }
  
    connectedCallback() {
      this.innerHTML = `
      <div class="h-full w-64 bg-gray-800 text-white shadow-lg flex flex-col">
        <div class="p-4 flex items-center space-x-3 border-b border-gray-700">
          <img src="" alt="Profile" class="w-10 h-10 rounded-full" />
          <div>
            <a href="/profile" class="text-lg font-semibold hover:underline">John Doe</a>
          </div>
        </div>
        <nav class="flex-1 p-4 overflow-y-auto">
          <ul class="space-y-3">
            <li class="group relative">
              <a href="#" class="block p-2 rounded-lg hover:bg-gray-700 flex justify-between items-center">
                🎮 Play
                <span class="group-hover:rotate-90 transition-transform duration-300">▶</span>
              </a>
              <!-- Submenu -->
              <ul class="relative left-0 w-full hidden group-hover:block bg-gray-700 rounded-lg space-y-1 p-2 transition-all duration-300 ease-in-out transform opacity-0 group-hover:opacity-100 group-hover:translate-y-2">
                <li><a href="/match" class="block px-4 py-2 hover:bg-gray-600 rounded">1v1 Local</a></li>
                <li><a href="/play/remote" class="block px-4 py-2 hover:bg-gray-600 rounded">1v1 Remote</a></li>
                <li><a href="/play/tournament" class="block px-4 py-2 hover:bg-gray-600 rounded">Tournament</a></li>
              </ul>
            </li>
            <li>
              <a href="/messages" class="block p-2 rounded-lg hover:bg-gray-700">✉️ Messages</a>
            </li>
            <li>
              <a href="/settings" class="block p-2 rounded-lg hover:bg-gray-700">⚙️ Settings</a>
            </li>
          </ul>
        </nav>
        <button id="querynotifyBtn" class="w-full p-2 bg-red-600 rounded-lg hover:bg-red-700">
              🚪 notify
          </button>
        <div class="p-4 border-t border-gray-700">
          <button class="w-full p-2 bg-red-600 rounded-lg hover:bg-red-700">🚪 Logout</button>
        </div>
      </div>
    `;
    }
  }
  
  customElements.define("nav-bar", Navbar);
  
  export { Navbar };
  