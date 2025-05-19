import { db } from "../db/db.js"
import {
  MatchMakingTypes,
  GameResultTypes
} from "transcendence";

const dbConverters = {

  async getAllTournamentsRuntimeTyped() {
    const stmt = db.prepare('SELECT * FROM tournaments');
    const rawDBTournaments: MatchMakingTypes.RawDBTournament[] = stmt.all() as MatchMakingTypes.RawDBTournament[];
    const typedTournaments: MatchMakingTypes.Tournament[] = [];
    for (const rawDBTournament of rawDBTournaments) {
      typedTournaments.push(this.constructTournamentFromRawDB(rawDBTournament));
    }
    return typedTournaments;
  },
  
  /**
   * @param {any} rawDBTournament 
   * @returns {MatchMakingTypes.Tournament}
   */
  constructTournamentFromRawDB(rawDBTournament: MatchMakingTypes.RawDBTournament): MatchMakingTypes.Tournament {
    const tournament: MatchMakingTypes.Tournament = {
      tournamentId: rawDBTournament.id.toString(),
      player1Id: rawDBTournament.player1Id,
      player2Id: rawDBTournament.player2Id,
      player3Id: rawDBTournament.player3Id,
      player4Id: rawDBTournament.player4Id,
      matchSemifinale1: null,
      matchSemifinale2: null,
      matchFinale: null,
      matchBronze: null,
      matchResultSemifinale1: null,
      matchResultSemifinale2: null,
      matchResultFinale: null,
      matchResultBronze: null,
      started: rawDBTournament.matchSemifinale1Id? true : false,
      playedAt: null
    }
    if (rawDBTournament.matchSemifinale1Id !== null) {
      const rawDBMatch = db.prepare('SELECT * FROM matches WHERE id = ?').get(rawDBTournament.matchSemifinale1Id) as MatchMakingTypes.RawDBMatch;
      // console.log(rawDBMatch);
      const match: MatchMakingTypes.BasicGame = dbConverters.constructBasicGameFromRawDB(rawDBMatch, tournament.tournamentId as string);
      tournament.matchSemifinale1 = match;
      const matchResult: GameResultTypes.MatchResult | null = dbConverters.constructMatchResultFromRawDB(rawDBMatch);
      if (matchResult)
        tournament.matchResultSemifinale1 = matchResult;
    }
    if (rawDBTournament.matchSemifinale2Id !== null) {
      const rawDBMatch = db.prepare('SELECT * FROM matches WHERE id = ?').get(rawDBTournament.matchSemifinale2Id) as MatchMakingTypes.RawDBMatch;
      const match: MatchMakingTypes.BasicGame = dbConverters.constructBasicGameFromRawDB(rawDBMatch, tournament.tournamentId as string);
      tournament.matchSemifinale2 = match;
      const matchResult: GameResultTypes.MatchResult | null = dbConverters.constructMatchResultFromRawDB(rawDBMatch);
      if (matchResult)
        tournament.matchResultSemifinale2 = matchResult;
    }
    if (rawDBTournament.matchFinaleId !== null) {
      const rawDBMatch = db.prepare('SELECT * FROM matches WHERE id = ?').get(rawDBTournament.matchFinaleId) as MatchMakingTypes.RawDBMatch;
      const match: MatchMakingTypes.BasicGame = dbConverters.constructBasicGameFromRawDB(rawDBMatch, tournament.tournamentId as string);
      tournament.matchFinale = match;
      const matchResult: GameResultTypes.MatchResult | null = dbConverters.constructMatchResultFromRawDB(rawDBMatch);
      if (matchResult)
        tournament.matchResultFinale = matchResult;
    }
    if (rawDBTournament.matchBronzeId !== null) {
      const rawDBMatch = db.prepare('SELECT * FROM matches WHERE id = ?').get(rawDBTournament.matchBronzeId) as MatchMakingTypes.RawDBMatch;
      const match: MatchMakingTypes.BasicGame = dbConverters.constructBasicGameFromRawDB(rawDBMatch, tournament.tournamentId as string);
      tournament.matchBronze = match;
      const matchResult: GameResultTypes.MatchResult | null = dbConverters.constructMatchResultFromRawDB(rawDBMatch);
      if (matchResult)
        tournament.matchResultBronze = matchResult;
    }
    return tournament;
  },

  constructBasicGameFromRawDB(rawDBMatch: MatchMakingTypes.RawDBMatch, tournamentId: string): MatchMakingTypes.BasicGame {
    
    const isMatchPlayed: boolean = (rawDBMatch.player1Score === null || rawDBMatch.player2Score === null)? false : true;

    const basicGame = {
      matchId: rawDBMatch.id.toString(),
      hostId: rawDBMatch.player1Id,
      oponentId: isMatchPlayed? rawDBMatch.player2Id : null,
      type: "tournament" as "tournament",
      invitedPlayerId: isMatchPlayed? null : rawDBMatch.player2Id,
      tournamentId: tournamentId,
    }
    return basicGame;
  },

  constructMatchResultFromRawDB(rawDBMatch: MatchMakingTypes.RawDBMatch): GameResultTypes.MatchResult | null {

    if (rawDBMatch.player1Score === null || rawDBMatch.player2Score === null) {
      return null;
    }

    const winnerId = rawDBMatch.player1Score > rawDBMatch.player2Score ? rawDBMatch.player1Id : rawDBMatch.player2Id;

    const matchResult: GameResultTypes.MatchResult = {
      matchId: rawDBMatch.id.toString(),
      player1Id: rawDBMatch.player1Id,
      player2Id: rawDBMatch.player2Id,
      player1Score: rawDBMatch.player1Score,
      player2Score: rawDBMatch.player2Score,
      winnerId: winnerId,
      createdAt: rawDBMatch.playedAt || "0"
    }
    return matchResult;
  }

}

export { dbConverters };