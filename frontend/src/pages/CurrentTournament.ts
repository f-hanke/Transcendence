import {
  GameResultTypes,
  isDefined,
  matchmakingTypeGuards,
  MatchMakingTypes,
} from "transcendence";
import { createHtmlElementFromString, getCurDateString } from "../utils/utils";
import { ChatInterface } from "../backendInterface/chatInterface";
import { MatchMakingInterface } from "../backendInterface/matchmakingInterface";
import { createHtmlElementFromString, getCurDateString } from "../utils/utils";
import { ChatInterface } from "../backendInterface/chatInterface";
import { MatchMakingInterface } from "../backendInterface/matchmakingInterface";

const tournamentState1: MatchMakingTypes.TournamentWithRanking = {
  rank1PlayerId: "d",
  rank2PlayerId: null,
  rank3PlayerId: "a",
  rank4PlayerId: "b",
  player1Id: "a",
  player2Id: "b",
  player3Id: "c",
  player4Id: "d",
  tournamentId: "1234",
  started: true,
  playedAt: null,
  matchSemifinale1: {
    hostId: "a",
    invitedPlayerId: "b",
    matchId: "ab",
    oponentId: null,
    tournamentId: "1234",
    type: "tournament",
    needsServerInitiation: true,
  },
  matchSemifinale2: {
    hostId: "1",
    invitedPlayerId: "d",
    matchId: "bc",
    oponentId: null,
    tournamentId: "1234",
    type: "tournament",
    needsServerInitiation: true,
  },
  matchBronze: null,
  matchFinale: null,
  matchResultSemifinale1: {
    createdAt: "",
    matchId: "231",
    player1Id: "a",
    player2Id: "b",
    winnerId: "a",
    player1Score: 5,
    player2Score: 3,
  },
  matchResultSemifinale2: null,
  matchResultBronze: null,
  matchResultFinale: null,
};

const tournamentState1: MatchMakingTypes.TournamentWithRanking = {
  rank1PlayerId: "d",
  rank2PlayerId: null,
  rank3PlayerId: "a",
  rank4PlayerId: "b",
  player1Id: "a",
  player2Id: "b",
  player3Id: "c",
  player4Id: "d",
  tournamentId: "1234",
  started: true,
  playedAt: null,
  matchSemifinale1: {
    hostId: "a",
    invitedPlayerId: "b",
    matchId: "ab",
    oponentId: null,
    tournamentId: "1234",
    type: "tournament",
    needsServerInitiation: true,
  },
  matchSemifinale2: {
    hostId: "1",
    invitedPlayerId: "d",
    matchId: "bc",
    oponentId: null,
    tournamentId: "1234",
    type: "tournament",
    needsServerInitiation: true,
  },
  matchBronze: null,
  matchFinale: null,
  matchResultSemifinale1: {
    createdAt: "",
    matchId: "231",
    player1Id: "a",
    player2Id: "b",
    winnerId: "a",
    player1Score: 5,
    player2Score: 3,
  },
  matchResultSemifinale2: null,
  matchResultBronze: null,
  matchResultFinale: null,
};

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
  }

  disconnectedCallback() {
    if (this.unsubscribe) this.unsubscribe();
    if (this.unsubscribeLanguage) this.unsubscribeLanguage();
  }

  render() {
    const semi1Finished = isDefined(tournamentState1.matchResultSemifinale1);
    const semi2Finished = isDefined(tournamentState1.matchResultSemifinale2);
    // const bronzeFinished = isDefined(tournamentState1.matchResultBronze);
    // const finaleFinished = isDefined(tournamentState1.matchResultFinale);

    const rankingOrder = this.getRankingStatsTable();

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
           </tr>
         </thead>
         <tbody>
            ${rankingOrder.map((elem) => {
              return `
             <tr class="border-t border-gray-600 hover:bg-gray-700">
               <td class="px-4 py-2">${elem.rank}</td>
               <td class="px-4 py-2">${elem.playerId}</td>
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
                  ❌ GET DATA VIA API
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
          ? tournamentState1.matchResultSemifinale1
          : tournamentState1.matchSemifinale1
      )
    );
    matchContainerTourni.appendChild(
      this.renderMatch(
        "Semi-Finale 2",
        semi2Finished
          ? tournamentState1.matchResultSemifinale2
          : tournamentState1.matchSemifinale2
      )
    );
    matchContainerTourni.appendChild(
      this.renderMatch("Third Place Decider", tournamentState1.matchBronze)
    );
    matchContainerTourni.appendChild(
      this.renderMatch("Final", tournamentState1.matchFinale)
    );
  }

  renderMatch(
    heading: string,
    match: MatchMakingTypes.BasicGame | GameResultTypes.MatchResult | null
  ) {
    if (!isDefined(match))
      return createHtmlElementFromString(`
      <div class="my-2 bg-gray-700 p-4 border-gray-500 border-2">
        <h3>${heading}</h3>
        <div class="flex justify-between mb-1">
          <span>To be determined</span>
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
    const amHost = window.store.userStore.get().details.id === match.hostId;

    const htmlElem = createHtmlElementFromString(`
    <div class="my-2 bg-gray-700 p-4 border-white border-2">
        <h3>${heading}</h3>
        <div class="flex justify-between mb-1">
          <span>Player 1: ${match.hostId}</span>
          <span>Player 2: ${match.invitedPlayerId}</span>
          <span>
            ${
              amHost
                ? `<button id="createGameBtnTourni" class="w-full bg-green-600 hover:bg-green-700 py-2 rounded-lg">
                  ➕ Create Game
                  </button>`
                : `<button class="mr-1 border-gray-500 text-gray-500 border-2 border-dashed">Wait for Host</button>`
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
    const htmlElem = createHtmlElementFromString(`
    <div class="my-2 bg-gray-700 p-4 border-2 border-black">
        <h3>${heading}</h3>
        <div class="flex justify-between mb-1">
          <span>Player 1: ${match.player1Id}</span>
          <span>Player 2: ${match.player2Id}</span>
          <span>Result: ${match.player1Score} : ${match.player2Score}</span>
          <span>Winner: ${match.winnerId}</span>
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

  getRankingStatsTable() {
    tournamentState1.rank1PlayerId;
    tournamentState1.rank2PlayerId;
    tournamentState1.rank3PlayerId;
    tournamentState1.rank4PlayerId;

    tournamentState1.player1Id;
    tournamentState1.player2Id;
    tournamentState1.player3Id;
    tournamentState1.player4Id;

    const order = new Array(4).fill({
      playerId: "",
      rank: "-",
    }) as { playerId: string; rank: number | string }[];

    const rankPlayer1 = this.playerIsRanked(
      tournamentState1.player1Id as string
    );
    const rankPlayer2 = this.playerIsRanked(
      tournamentState1.player2Id as string
    );
    const rankPlayer3 = this.playerIsRanked(
      tournamentState1.player3Id as string
    );
    const rankPlayer4 = this.playerIsRanked(
      tournamentState1.player4Id as string
    );

    const unrankedPlayers: string[] = [];

    rankPlayer1
      ? (order[rankPlayer1 - 1] = {
          playerId: tournamentState1.player1Id as string,
          rank: rankPlayer1,
        })
      : unrankedPlayers.push(tournamentState1.player1Id as string);
    rankPlayer2
      ? (order[rankPlayer2 - 1] = {
          playerId: tournamentState1.player2Id as string,
          rank: rankPlayer2,
        })
      : unrankedPlayers.push(tournamentState1.player2Id as string);
    rankPlayer3
      ? (order[rankPlayer3 - 1] = {
          playerId: tournamentState1.player3Id as string,
          rank: rankPlayer3,
        })
      : unrankedPlayers.push(tournamentState1.player3Id as string);
    rankPlayer4
      ? (order[rankPlayer4 - 1] = {
          playerId: tournamentState1.player4Id as string,
          rank: rankPlayer4,
        })
      : unrankedPlayers.push(tournamentState1.player4Id as string);

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

  playerIsRanked(playerId: string) {
    switch (playerId) {
      case tournamentState1.rank1PlayerId:
        return 1;
      case tournamentState1.rank2PlayerId:
        return 2;
      case tournamentState1.rank3PlayerId:
        return 3;
      case tournamentState1.rank4PlayerId:
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
