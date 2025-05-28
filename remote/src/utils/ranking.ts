import {
  MatchMakingTypes
} from "transcendence";

const utils = {

  deriveTournamentWithRanking(tournament: MatchMakingTypes.Tournament) {
    const tournamentWithRanking: MatchMakingTypes.TournamentWithRanking = {
      tournamentId: tournament.tournamentId as string,
      player1Id: tournament.player1Id as string,
      player2Id: tournament.player2Id as string,
      player3Id: tournament.player3Id as string,
      player4Id: tournament.player4Id as string,
      matchSemifinale1: tournament.matchSemifinale1,
      matchSemifinale2: tournament.matchSemifinale2,
      matchFinale: tournament.matchFinale,
      matchBronze: tournament.matchBronze,
      matchResultSemifinale1: tournament.matchResultSemifinale1,
      matchResultSemifinale2: tournament.matchResultSemifinale2,
      matchResultFinale: tournament.matchResultFinale,
      matchResultBronze: tournament.matchResultBronze,
      rank1PlayerId: null,
      rank2PlayerId: null,
      rank3PlayerId: null,
      rank4PlayerId: null,
      started: tournament.matchResultSemifinale1? true : false,
      playedAt: null,
      playersWhoClickedToLeave: tournament.playersWhoClickedToLeave,
    }

    if (tournament.matchResultFinale) {
      const winnerId = tournament.matchResultFinale.winnerId;
      const loserId = winnerId === tournament.matchResultFinale.player1Id ? tournament.matchResultFinale.player2Id : tournament.matchResultFinale.player1Id;
      tournamentWithRanking.rank1PlayerId = winnerId;
      tournamentWithRanking.rank2PlayerId = loserId;
    }
    if (tournament.matchResultBronze) {
      const winnerId = tournament.matchResultBronze.winnerId;
      const loserId = winnerId === tournament.matchResultBronze.player1Id ? tournament.matchResultBronze.player2Id : tournament.matchResultBronze.player1Id;
      tournamentWithRanking.rank3PlayerId = winnerId;
      tournamentWithRanking.rank4PlayerId = loserId;
    }
    return tournamentWithRanking;
  }
};

export { utils };