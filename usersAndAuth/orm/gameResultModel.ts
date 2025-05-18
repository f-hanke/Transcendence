/**
 * Match Model
 */

import { GameResultTypes } from 'transcendence'

'use strict';

import { db } from '../db/db.js';

const GameResultModel = {
    
    /**
     * not for tournament matches
    */
    recordNewSimpleMatch: async (matchData: GameResultTypes.MatchResult) => {
        try {
            db.prepare(`
                INSERT INTO matches (id, player1Id, player2Id, player1Score, player2Score, winnerId, createdAt)
                VALUES (?, ?, ?, ?, ?, ?, ?)
            `)
            .run(
                matchData.matchId,
                matchData.player1Id,
                matchData.player2Id,
                matchData.player1Score,
                matchData.player2Score,
                matchData.winnerId,
                matchData.createdAt
            );

            // Record the match for each user
            for (const userId of [matchData.player1Id, matchData.player2Id]) {
                await GameResultModel.recordUserMatch(userId, matchData.matchId);
            }
        }
        catch (db_error) {
            throw db_error;
        }
    },

    recordNewTournamentMatch: async (matchData: GameResultTypes.MatchResult) => {
        try {
            db.prepare(`
                INSERT INTO matches (id, player1Id, player2Id, player1Score, player2Score, winnerId, createdAt)
                VALUES (?, ?, ?, ?, ?, ?, ?)
            `).run(
                matchData.matchId,
                matchData.player1Id,
                matchData.player2Id,
                matchData.player1Score,
                matchData.player2Score,
                matchData.winnerId,
                matchData.createdAt
            );
        }
        catch (db_error) {
            throw db_error;
        }
    },

    recordNewTournament: async (tournamentData: GameResultTypes.TournamentResult) => {
        try {
            db.prepare(`
                INSERT INTO tournaments (id, player1Id, player2Id, player3Id, player4Id, matchSemifinale1, matchSemifinale2, matchFinale, matchBronze, createdAt)
                VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
            `).run(
                tournamentData.tournamentId,
                tournamentData.rank1PlayerId,
                tournamentData.rank2PlayerId,
                tournamentData.rank3PlayerId,
                tournamentData.rank4PlayerId,
                tournamentData.matchSemifinale1.matchId,
                tournamentData.matchSemifinale2.matchId,
                tournamentData.matchFinale.matchId,
                tournamentData.matchBronze.matchId,
                tournamentData.createdAt
            );

            // Record the 4 tournament matches without adding them to user_matches
            await GameResultModel.recordNewTournamentMatch(tournamentData.matchSemifinale1);
            await GameResultModel.recordNewTournamentMatch(tournamentData.matchSemifinale2);
            await GameResultModel.recordNewTournamentMatch(tournamentData.matchFinale);
            await GameResultModel.recordNewTournamentMatch(tournamentData.matchBronze);

            // Record the user_tournament for each user
            await GameResultModel.recordUserTournament(tournamentData.rank1PlayerId, tournamentData.tournamentId);
            await GameResultModel.recordUserTournament(tournamentData.rank2PlayerId, tournamentData.tournamentId);
            await GameResultModel.recordUserTournament(tournamentData.rank3PlayerId, tournamentData.tournamentId);
            await GameResultModel.recordUserTournament(tournamentData.rank4PlayerId, tournamentData.tournamentId);

        }
        catch (db_error) {
            throw db_error;
        }
    },

    /**
     * for simple matches only, not for tournament matches
    */
    recordUserMatch: async (userId: string, matchId: string) => {
        try {
            db.prepare(`
                INSERT INTO user_matches (user_id, match_id)
                VALUES (?, ?)
            `).run(userId, matchId);
        }
        catch (db_error) {
            throw db_error;
        }
    },

    recordUserTournament: async (userId: string, tournamentId: string) => {
        try {
            db.prepare(`
                INSERT INTO user_tournaments (user_id, tournament_id)
                VALUES (?, ?)
            `).run(userId, tournamentId);
        }
        catch (db_error) {
            throw db_error;
        }
    },

    reconstructTournamentResultObject: async (rawTournamentData: GameResultTypes.RawDBRecordTournamentResult) => {
        try {
            const matchSemifinale1: GameResultTypes.MatchResult = await GameResultModel.fetchMatchAsMatchResultObject(rawTournamentData.matchSemifinale1Id);
            const matchSemifinale2: GameResultTypes.MatchResult = await GameResultModel.fetchMatchAsMatchResultObject(rawTournamentData.matchSemifinale2Id);
            const matchFinale: GameResultTypes.MatchResult = await GameResultModel.fetchMatchAsMatchResultObject(rawTournamentData.matchFinaleId);
            const matchBronze: GameResultTypes.MatchResult = await GameResultModel.fetchMatchAsMatchResultObject(rawTournamentData.matchBronzeId);
            const tournamentResult: GameResultTypes.TournamentResult = {
                tournamentId: rawTournamentData.id.toString(),
                rank1PlayerId: rawTournamentData.rank1PlayerId.toString(),
                rank2PlayerId: rawTournamentData.rank2PlayerId.toString(),
                rank3PlayerId: rawTournamentData.rank3PlayerId.toString(),
                rank4PlayerId: rawTournamentData.rank4PlayerId.toString(),
                matchSemifinale1: matchSemifinale1,
                matchSemifinale2: matchSemifinale2,
                matchFinale: matchFinale,
                matchBronze: matchBronze,
                createdAt: rawTournamentData.createdAt
            };
            return tournamentResult as GameResultTypes.TournamentResult;
        }
        catch (db_error) {
            throw db_error;
        }
    },

    fetchMatchAsMatchResultObject: async (matchId: number) => {
        try {
            const stmt = db.prepare(`
                SELECT *
                FROM matches
                WHERE id = ?
            `);
            const result: GameResultTypes.RawDBRecordMatchResult = stmt.get(matchId) as GameResultTypes.RawDBRecordMatchResult;
            if (!result) {
                throw new Error(`Match with ID ${matchId} not found`);
            }
            const matchResult: GameResultTypes.MatchResult = {
                matchId: result.id.toString(),
                player1Id: result.player1Id.toString(),
                player2Id: result.player2Id.toString(),
                player1Score: result.player1Score,
                player2Score: result.player2Score,
                winnerId: result.winnerId.toString(),
                createdAt: result.createdAt
            };
            return matchResult as GameResultTypes.MatchResult;
        } catch (db_error) {
            throw db_error;
        }
    },

    /**
     * for simple matches only, not for tournament matches
    */
    fetchUserMatches: async (userId: string) => {
        try {
            const allUserMatchRecords: GameResultTypes.MatchResult[] = [];
            const stmt = db.prepare(`
                SELECT m.*
                FROM matches m
                JOIN user_matches um ON m.id = um.match_id
                WHERE um.user_id = ?
            `);
            const results: GameResultTypes.RawDBRecordMatchResult[] = stmt.all(userId) as GameResultTypes.RawDBRecordMatchResult[];
            for (let result of results) {
                allUserMatchRecords.push(await GameResultModel.fetchMatchAsMatchResultObject(result.id));
            }
            return allUserMatchRecords as GameResultTypes.MatchResult[];
        } catch (db_error) {
            throw db_error;
        }
    },

    fetchUserTournaments: async (userId: string) => {
        try {
            const allUserTournamentRecords: GameResultTypes.TournamentResult[] = [];

            const stmt = db.prepare(`
                SELECT t.*
                FROM tournaments t
                JOIN user_tournaments ut ON t.id = ut.tournament_id
                WHERE ut.user_id = ?
            `);
            const results: GameResultTypes.RawDBRecordTournamentResult[] = stmt.all(userId) as GameResultTypes.RawDBRecordTournamentResult[];
            for (let result of results) {
                allUserTournamentRecords.push(await GameResultModel.reconstructTournamentResultObject(result));
            }

            return allUserTournamentRecords as GameResultTypes.TournamentResult[];
        } catch (db_error) {
            throw db_error;
        }
    }

}

export { GameResultModel };