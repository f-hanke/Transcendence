import { MatchMakingTypes } from "transcendence";
import { MatchMakingInterface } from "../backendInterface/matchmakingInterface";

class CurrentTournament extends HTMLElement {
  unsubscribe: null | (() => void);
  unsubscribeLanguage: null | (() => void);
  players: Record<string, string | number>[];
  games: Record<string, string>[];
  constructor() {
    super();
    this.unsubscribe = null;
    this.unsubscribeLanguage = null;

    this.players = [
      { name: "Alice", rank: 1, wins: 3, losses: 0 },
      { name: "Bob", rank: 2, wins: 2, losses: 1 },
      { name: "Charlie", rank: 3, wins: 1, losses: 2 },
      { name: "Dave", rank: 4, wins: 0, losses: 3 },
    ];

    this.games = [
      {
        player1: "Alice",
        player2: "Bob",
        score: "11–8",
        winner: "Alice",
        date: "2025-05-01 14:00",
      },
      {
        player1: "Charlie",
        player2: "Dave",
        score: "11–5",
        winner: "Charlie",
        date: "2025-05-01 15:00",
      },
      {
        player1: "Alice",
        player2: "Charlie",
        score: "11–9",
        winner: "Alice",
        date: "2025-05-02 13:30",
      },
      {
        player1: "Bob",
        player2: "Dave",
        score: "11–6",
        winner: "Bob",
        date: "2025-05-02 14:30",
      },
    ];
  }

  connectedCallback() {
    // remove any old event listeners from running macthes
    this.render();
    this.unsubscribe = window.store.currentTournamentStore.subscribe(
      this.render.bind(this)
    );
    this.unsubscribeLanguage = window.store.languageStore.subscribe(
      this.render.bind(this)
    );
  }

  disconnectedCallback() {
    if (this.unsubscribe) this.unsubscribe();
    if (this.unsubscribeLanguage) this.unsubscribeLanguage();
  }

  render() {
    const curTournament =
      window.store.currentTournamentStore.get() as MatchMakingTypes.TournamentWithRanking;
    if (curTournament === null) {
      this.innerHTML = `
       <div class="">You are currently not part of any tournament!</div>
       <button id="getDataTournament" class="leave-tournament-btn bg-red-600 hover:bg-red-700 text-white py-1 px-3 rounded-lg">
                  ❌ GET DATA VIA API
      </button>
    `;

      const btn = document.querySelector(
        "#getDataTournament"
      ) as HTMLDivElement;

      btn.addEventListener("click", async () => {
        const res = await MatchMakingInterface.getCurrentTournament();
        console.log("GOT TOURNI DATA");
        console.log(res);
      });
    } else {
      this.innerHTML = `
       <div class="p-4 w-full bg-gray-800 text-white rounded-lg shadow-md">
        <h2 class="text-lg font-semibold mb-4">🏓 Tournament Overview</h2>
        <div class="mb-6">
          <h3 class="text-md font-semibold mb-2">Player Rankings</h3>
          <table class="w-full text-sm table-auto border-collapse">
            <thead>
              <tr class="bg-gray-700 text-left">
                <th class="px-4 py-2">Rank</th>
                <th class="px-4 py-2">Name</th>
                <th class="px-4 py-2">Wins</th>
                <th class="px-4 py-2">Losses</th>
              </tr>
            </thead>
            <tbody>
              ${curTournament.Ranking.sort(
                (a, b) => (a.rank as number) - (b.rank as number)
              )
                .map(
                  (player) => `
                <tr class="border-t border-gray-600 hover:bg-gray-700">
                  <td class="px-4 py-2">${player.rank}</td>
                  <td class="px-4 py-2">${player.id}</td>
                  <td class="px-4 py-2">${player.wins}</td>
                  <td class="px-4 py-2">${player.losses}</td>
                </tr>
              `
                )
                .join("")}
            </tbody>
          </table>
        </div>

        <div>
          <h3 class="text-md font-semibold mb-2">Match History</h3>
          <div class="space-y-2">
            ${this.games
              .map(
                (match) => `
              <div class="p-3 bg-gray-700 rounded shadow text-sm">
                <div class="flex justify-between mb-1">
                  <span>${match.player1} vs ${match.player2}</span>
                  <span class="text-green-400 font-semibold">${match.winner} won</span>
                </div>
                <div class="grid grid-cols-3 gap-4 text-gray-300 text-xs">
                  <div class="truncate">${match.date}</div>
                  <div class="truncate">Score: ${match.score}</div>
                  <div class="truncate">🏆 Tournament</div>
                </div>
              </div>
            `
              )
              .join("")}
          </div>
        </div>
      </div>
      `;
    }
  }

  renderMockup() {
    this.innerHTML = `
      <div class="p-4 w-full bg-gray-800 text-white rounded-lg shadow-md">
        <h2 class="text-lg font-semibold mb-4">🏓 Tournament Overview</h2>
        
        <div class="mb-6">
          <h3 class="text-md font-semibold mb-2">Player Rankings</h3>
          <table class="w-full text-sm table-auto border-collapse">
            <thead>
              <tr class="bg-gray-700 text-left">
                <th class="px-4 py-2">Rank</th>
                <th class="px-4 py-2">Name</th>
                <th class="px-4 py-2">Wins</th>
                <th class="px-4 py-2">Losses</th>
              </tr>
            </thead>
            <tbody>
              ${this.players
                .sort((a, b) => (a.rank as number) - (b.rank as number))
                .map(
                  (player) => `
                <tr class="border-t border-gray-600 hover:bg-gray-700">
                  <td class="px-4 py-2">${player.rank}</td>
                  <td class="px-4 py-2">${player.name}</td>
                  <td class="px-4 py-2">${player.wins}</td>
                  <td class="px-4 py-2">${player.losses}</td>
                </tr>
              `
                )
                .join("")}
            </tbody>
          </table>
        </div>

        <div>
          <h3 class="text-md font-semibold mb-2">Match History</h3>
          <div class="space-y-2">
            ${this.games
              .map(
                (match) => `
              <div class="p-3 bg-gray-700 rounded shadow text-sm">
                <div class="flex justify-between mb-1">
                  <span>${match.player1} vs ${match.player2}</span>
                  <span class="text-green-400 font-semibold">${match.winner} won</span>
                </div>
                <div class="grid grid-cols-3 gap-4 text-gray-300 text-xs">
                  <div class="truncate">${match.date}</div>
                  <div class="truncate">Score: ${match.score}</div>
                  <div class="truncate">🏆 Tournament</div>
                </div>
              </div>
            `
              )
              .join("")}
          </div>
        </div>
      </div>
    `;
  }
}

customElements.define("current-tournament", CurrentTournament);

export { CurrentTournament };
