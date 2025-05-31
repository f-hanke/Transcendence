import {
  GameResultTypes,
  isDefined,
  matchmakingTypeGuards,
  MatchMakingTypes,
} from "transcendence";
import { createHtmlElementFromString } from "../utils/utils";
import { ChatInterface } from "../backendInterface/chatInterface";
import { MatchMakingInterface } from "../backendInterface/matchmakingInterface";
import { TournamentState } from "../state/tournamentStateTypes";

class CurrentTournament extends HTMLElement {
  unsubscribe: null | (() => void);
  unsubscribeLanguage: null | (() => void);
  constructor() {
    super();
    this.unsubscribe = null;
    this.unsubscribeLanguage = null;
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
    MatchMakingInterface.getCurrentTournament();
  }

  disconnectedCallback() {
    if (this.unsubscribe) this.unsubscribe();
    if (this.unsubscribeLanguage) this.unsubscribeLanguage();
  }

  render() {
    const lang = window.store.languageStore.state.currentTournament;
    const tournamentState = window.store.currentTournamentStore.get();
    if (isDefined(tournamentState)) {
      const semi1Finished = isDefined(
        tournamentState.matchResultSemifinale1
      );
      const semi2Finished = isDefined(
        tournamentState.matchResultSemifinale2
      );
      // const bronzeFinished = isDefined(tournamentState1.matchResultBronze);
      // const finaleFinished = isDefined(tournamentState1.matchResultFinale);

      const rankingOrder = this.getRankingStatsTable(tournamentState as NonNullable<TournamentState>);

      this.innerHTML = `
    <div class="p-4 w-full bg-gray-800 text-white rounded-lg shadow-md">
     <h2 class="text-lg font-semibold mb-4">🏓 ${lang.title || "Tournament Overview"}</h2>
     <div class="mb-6">
       <h3 class="text-md font-semibold mb-2">${lang.rankings || "Player Rankings"}</h3>
       <table class="w-full text-sm table-auto border-collapse">
         <thead>
           <tr class="bg-gray-700 text-left">
            <th class="px-4 py-2">${lang.rank || "Rank"}</th>
            <th class="px-4 py-2">${lang.name || "Name"}</th>
           </tr>
         </thead>
         <tbody>
            ${rankingOrder.map((elem) => {
              return `
             <tr class="border-t border-gray-600 hover:bg-gray-700">
               <td class="px-4 py-2">${elem.rank}</td>
               <td class="px-4 py-2">${window.store.playerNamesStore.getName(elem.playerId)}</td>
             </tr>
           `;
            })}
         </tbody>
       </table>
     </div>

    <div id="matchContainerTourni" class="p-3 rounded shadow text-sm">
    </div>
     `;

      const matchContainerTourni = document.querySelector(
        "#matchContainerTourni"
      ) as HTMLDivElement;

      // dev stuff******************

      const btn =
        createHtmlElementFromString(`<button id="getDataTournament" class="leave-tournament-btn bg-red-600 hover:bg-red-700 text-white py-1 px-3 rounded-lg">
                  ❌ ${lang.getDataBtn || "GET DATA VIA API"}
      </button>`);

      btn.addEventListener("click", async () => {
        const res = await MatchMakingInterface.getCurrentTournament();
        console.log("GOT TOURNI DATA");
        console.log(res);
      });

      matchContainerTourni.appendChild(btn);

      // dev stuff******************

      matchContainerTourni.appendChild(
        this.renderMatch(
          "Semi-Finale 1",
          semi1Finished
            ? tournamentState.matchResultSemifinale1
            : tournamentState.matchSemifinale1
        )
      );
      matchContainerTourni.appendChild(
        this.renderMatch(
          "Semi-Finale 2",
          semi2Finished
            ? tournamentState.matchResultSemifinale2
            : tournamentState.matchSemifinale2
        )
      );
      matchContainerTourni.appendChild(
        this.renderMatch(
          "Third Place Decider",
          tournamentState.matchBronze
        )
      );
      matchContainerTourni.appendChild(
        this.renderMatch("Final", tournamentState.matchFinale)
      );
    }
  }

  renderMatch(
    heading: string,
    match: MatchMakingTypes.BasicGame | GameResultTypes.MatchResult | null
  ) {
    const lang = window.store.languageStore.state.currentTournament;
    if (!isDefined(match))
      return createHtmlElementFromString(`
      <div class="my-2 bg-gray-700 p-4 border-gray-500 border-2">
        <h3>${heading}</h3>
        <div class="flex justify-between mb-1">
          <span>${lang.toBeDetermined || "To be determined"}</span>
        </div>
    </div>
    `);
    else if (matchmakingTypeGuards.isBasicGame(match)) {
      return this.renderMatchToBePlayed(heading, match);
    } else {
      return this.renderMatchFinished(heading, match);
    }
  }

  renderMatchToBePlayed(heading: string, match: MatchMakingTypes.BasicGame) {
    const lang = window.store.languageStore.state.currentTournament;
    const amHost = window.store.userStore.get().details.id === match.hostId;
    const amPartOfGame = amHost || window.store.userStore.get().details.id === match.invitedPlayerId

    const htmlElem = createHtmlElementFromString(`
    <div class="my-2 bg-gray-700 p-4 border-white border-2">
        <h3>${heading}</h3>
        <div class="flex justify-between mb-1">
        <span>${lang.player1 || "Player 1"}: ${window.store.playerNamesStore.getName(match.hostId)}</span>
        <span>${lang.player2 || "Player 2"}: ${window.store.playerNamesStore.getName(match.invitedPlayerId as string)}</span>
          <span>
            ${
              amHost
                ? `<button id="createGameBtnTourni" class="w-full bg-green-600 hover:bg-green-700 py-2 rounded-lg">
                  ➕ ${lang.createGame || "Create Game"}
                  </button>`
                : amPartOfGame ?
                `<button class="mr-1 border-gray-500 text-gray-500 border-2 border-dashed">Wait for Host</button>`
                : `<div>${lang.notParticipant || "None of your business!"}
</div>`
            }
          </span>
        </div>
    </div>
    `);

    if (amHost) {
      const createGameBtn = htmlElem.querySelector(
        "#createGameBtnTourni"
      ) as HTMLButtonElement;

      createGameBtn.addEventListener("click", (event) => {
        event.stopPropagation();
        ChatInterface.inviteToPlayTournamentMatch(match);
      });
    }
    return htmlElem;
  }

  renderMatchFinished(heading: string, match: GameResultTypes.MatchResult) {
    const lang = window.store.languageStore.state.currentTournament;
    const htmlElem = createHtmlElementFromString(`
    <div class="my-2 bg-gray-700 p-4 border-2 border-black">
        <h3>${heading}</h3>
        <div class="flex justify-between mb-1">
        <span>${lang.player1 || "Player 1"}: ${window.store.playerNamesStore.getName(match.player1Id)}</span>
        <span>${lang.player2 || "Player 2"}: ${window.store.playerNamesStore.getName(match.player2Id)}</span>
        <span>${lang.result || "Result"}: ${match.player1Score} : ${match.player2Score}</span>
        <span>${lang.winner || "Winner"}: ${match.winnerId}</span>
        </div>
    </div>
    `);
    return htmlElem;
  }

  //       <div>
  //         <h3 class="text-md font-semibold mb-2">Match History</h3>
  //         <div class="space-y-2">
  //           ${this.games
  //             .map(
  //               (match) => `
  //             <div class="p-3 bg-gray-700 rounded shadow text-sm">
  //               <div class="flex justify-between mb-1">
  //                 <span>${match.player1} vs ${match.player2}</span>
  //                 <span class="text-green-400 font-semibold">${match.winner} won</span>
  //               </div>
  //               <div class="grid grid-cols-3 gap-4 text-gray-300 text-xs">
  //                 <div class="truncate">${match.date}</div>
  //                 <div class="truncate">Score: ${match.score}</div>
  //                 <div class="truncate">🏆 Tournament</div>
  //               </div>
  //             </div>
  //           `
  //             )
  //             .join("")}
  //         </div>
  //       </div>
  //     </div>
  //   `;
  // }

  getRankingStatsTable(tournamentState: NonNullable<TournamentState>) {

    const order = new Array(4).fill({
      playerId: "",
      rank: "-",
    }) as { playerId: string; rank: number | string }[];

    const rankPlayer1 = this.playerIsRanked(
      tournamentState.player1Id as string, tournamentState
    );
    const rankPlayer2 = this.playerIsRanked(
      tournamentState.player2Id as string, tournamentState
    );
    const rankPlayer3 = this.playerIsRanked(
      tournamentState.player3Id as string, tournamentState
    );
    const rankPlayer4 = this.playerIsRanked(
      tournamentState.player4Id as string, tournamentState
    );

    const unrankedPlayers: string[] = [];

    rankPlayer1
      ? (order[rankPlayer1 - 1] = {
          playerId: tournamentState.player1Id as string,
          rank: rankPlayer1,
        })
      : unrankedPlayers.push(tournamentState.player1Id as string);
    rankPlayer2
      ? (order[rankPlayer2 - 1] = {
          playerId: tournamentState.player2Id as string,
          rank: rankPlayer2,
        })
      : unrankedPlayers.push(tournamentState.player2Id as string);
    rankPlayer3
      ? (order[rankPlayer3 - 1] = {
          playerId: tournamentState.player3Id as string,
          rank: rankPlayer3,
        })
      : unrankedPlayers.push(tournamentState.player3Id as string);
    rankPlayer4
      ? (order[rankPlayer4 - 1] = {
          playerId: tournamentState.player4Id as string,
          rank: rankPlayer4,
        })
      : unrankedPlayers.push(tournamentState.player4Id as string);

    unrankedPlayers.forEach((playerId) => {
      for (const [index, rankPlayerId] of order.entries()) {
        if (!rankPlayerId.playerId) {
          order[index] = {
            playerId: playerId,
            rank: "-",
          };
          return;
        }
      }
    });

    return order;
  }

  playerIsRanked(playerId: string,tournamentState: NonNullable<TournamentState> ) {
    switch (playerId) {
      case tournamentState.rank1PlayerId:
        return 1;
      case tournamentState.rank2PlayerId:
        return 2;
      case tournamentState.rank3PlayerId:
        return 3;
      case tournamentState.rank4PlayerId:
        return 4;
    }
    return false;
  }

  // const inviteToPlayBtn = document.querySelector(
  //   `#${this.id}_inviteToPlayBtn`
  // ) as HTMLButtonElement;
  // inviteToPlayBtn.addEventListener("click", (event) => {
  //   event.stopPropagation();
  //   ChatInterface.inviteToPlay({
  //     authorId: window.store.userStore.get().details.id,
  //     recipientId: this.recipientId,
  //     date: getCurDateString(),
  //   });
  // });

  //   <div>
  //   <h3 class="text-md font-semibold mb-2">Match History</h3>
  //   <div class="space-y-2">
  //     ${this.games
  //       .map(
  //         (match) => `
  //       <div class="p-3 bg-gray-700 rounded shadow text-sm">
  //         <div class="flex justify-between mb-1">
  //           <span>${match.player1} vs ${match.player2}</span>
  //           <span class="text-green-400 font-semibold">${match.winner} won</span>
  //         </div>
  //         <div class="grid grid-cols-3 gap-4 text-gray-300 text-xs">
  //           <div class="truncate">${match.date}</div>
  //           <div class="truncate">Score: ${match.score}</div>
  //           <div class="truncate">🏆 Tournament</div>
  //         </div>
  //       </div>
  //     `
  //       )
  //       .join("")}
  //   </div>
  // </div>
  // </div>
  // `;
}

customElements.define("current-tournament", CurrentTournament);

export { CurrentTournament };
