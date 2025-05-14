import {
  MatchMakingTypes
} from "transcendence";

const utils = {
  deriveTournamentWithRanking(tournament: MatchMakingTypes.TournamentWithMatches) {
    const wins: MatchMakingTypes.PlayerStats[] = [
      { wins: 0, id: tournament.player1Id as string, rank: 0, losses: 0 },
      { wins: 0, id: tournament.player3Id as string, rank: 0, losses: 0 },
      { wins: 0, id: tournament.player2Id as string, rank: 0, losses: 0 },
      { wins: 0, id: tournament.player4Id as string, rank: 0, losses: 0 }
    ]

    // tournament.matchResults.reduce((prev, cur) => {
    //   switch(cur.winnerId){
    //     case tournament.player1Id:
    //       prev[0]++;
    //       break;
    //     case tournament.player2Id:
    //       prev[1]++;
    //       break;
    //     case tournament.player3Id:
    //       prev[2]++;
    //       break;
    //     case tournament.player4Id:
    //       prev[3]++;
    //       break;
    //   }
    //   return prev;
    // }, [0,0,0,0])

    for (let matchResult of tournament.matchResults) {
      const winner = wins.find((elem) => elem.id === matchResult.winnerId) as MatchMakingTypes.PlayerStats;
      winner.wins++;
    }
    const sortedWins = wins.sort((a, b) => a.wins - b.wins);
    let i = 1;

    sortedWins.forEach((elem, index) => {
      if (index === 0)
        elem.rank = i;
      else {
        elem.rank = i;
        if (elem.wins <= sortedWins[index - 1].wins)
          i++;
      }
    })

    const tournamentWithRanking: MatchMakingTypes.TournamentWithRanking = {
      tournamentId: tournament.tournamentId as string,
      player1Id: tournament.player1Id as string,
      player2Id: tournament.player2Id as string,
      player3Id: tournament.player3Id as string,
      player4Id: tournament.player4Id as string,
      Ranking: wins,
      matches: [],
      matchResults: []
    }
    return tournamentWithRanking;
  }
};

export { utils };