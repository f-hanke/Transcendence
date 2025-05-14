'use strict';
import { db } from '../db/db.js';
const GameResultModel = {
    recordNewMatch: async (matchData) => {
        try {
            const stmt = db.prepare(`
                INSERT INTO matches (id, p1_id, p2_id, p1_score, p2_score, winner_id, date)
                VALUES (?, ?, ?, ?, ?, ?, ?)
            `);
            const result = stmt.run(matchData.matchId, matchData.player1Id, matchData.player2Id, matchData.player1Score, matchData.player2Score, matchData.winnerId, matchData.createdAt);
            // Record the match for each user
            for (const userId of [matchData.player1Id, matchData.player2Id]) {
                const result = await GameResultModel.recordUserMatch(userId, matchData.matchId);
                if (!result) {
                    throw new Error(`Failed to record match for user ${userId}`);
                }
            }
            return result.changes > 0;
        }
        catch (db_error) {
            throw db_error;
        }
    },
    recordNewTournament: async (tournamentData) => {
        try {
            const stmt = db.prepare(`
                INSERT INTO tournaments (id, p1_id, p2_id, p3_id, p4_id, p1_score, p2_score, p3_score, p4_score, date)
                VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
            `);
            const result = stmt.run(tournamentData.tournamentId, tournamentData.playerRank1Id, tournamentData.playerRank2Id, tournamentData.playerRank3Id, tournamentData.playerRank4Id, tournamentData.playerRank1Score, tournamentData.playerRank2Score, tournamentData.playerRank3Score, tournamentData.playerRank4Score, tournamentData.createdAt);
            // Record the tournament for each user
            for (const userId of [
                tournamentData.playerRank1Id,
                tournamentData.playerRank2Id,
                tournamentData.playerRank3Id,
                tournamentData.playerRank4Id
            ]) {
                const result = await GameResultModel.recordTournamentMatch(userId, tournamentData.tournamentId);
                if (!result) {
                    throw new Error(`Failed to record tournament for user ${userId}`);
                }
            }
            return result.changes > 0;
        }
        catch (db_error) {
            throw db_error;
        }
    },
    recordUserMatch: async (userId, matchId) => {
        try {
            const stmt = db.prepare(`
                INSERT INTO user_matches (user_id, match_id)
                VALUES (?, ?)
            `);
            const result = stmt.run(userId, matchId);
            return result.changes > 0;
        }
        catch (db_error) {
            throw db_error;
        }
    },
    recordTournamentMatch: async (userId, tournamentId) => {
        try {
            const stmt = db.prepare(`
                INSERT INTO user_tournaments (user_id, tournament_id)
                VALUES (?, ?)
            `);
            const result = stmt.run(userId, tournamentId);
            return result.changes > 0;
        }
        catch (db_error) {
            throw db_error;
        }
    },
    fetchUserMatches: async (userId) => {
        try {
            const stmt = db.prepare(`
                SELECT m.*
                FROM matches m
                JOIN user_matches um ON m.id = um.match_id
                WHERE um.user_id = ?
            `);
            const result = stmt.all(userId);
            return result;
        }
        catch (db_error) {
            throw db_error;
        }
    },
    fetchUserTournaments: async (userId) => {
        try {
            const stmt = db.prepare(`
                SELECT t.*
                FROM tournaments t
                JOIN user_tournaments ut ON t.id = ut.tournament_id
                WHERE ut.user_id = ?
            `);
            const result = stmt.all(userId);
            return result;
        }
        catch (db_error) {
            throw db_error;
        }
    }
};
export { GameResultModel };
