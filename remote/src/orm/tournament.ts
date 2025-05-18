/**
 * Tournament model
 */

import { MatchMakingTypes } from 'transcendence'

'use strict';

import { db } from '../db/db.js';

const Tournament = {
  /**
   * Create a new Tournament (lobby)
   * @param {string} playerId host playerId
   * @returns {string} The newly created TournamentId
   */
  async create(playerId: string) {
    try {
      // Insert tournament
      const stmt = db.prepare(`
        INSERT INTO tournaments (player1Id)
        VALUES (?)
      `);
      console.log(stmt.all);
      const result = stmt.run(playerId);
      const tournamentId = result.lastInsertRowid.toString();
      db.prepare(`INSERT INTO playerTournaments (playerId, tournamentId) VALUES (?, ?)`).run(playerId, tournamentId);
      return tournamentId;
    } catch (db_error) {
      throw db_error;  // just passing along without trying to interpret
    }
  },

  /**
   * Delete Tournament by ID and delete playerTournaments for that tournament
   * @param {string} id Tournament ID
   */
  async delete(id: string) {
    try {
      db.prepare('DELETE FROM tournaments WHERE id = ?').run(id);
      db.prepare('DELETE FROM playerTournaments WHERE tournamentId = ?').run(id);
    } catch (db_error) {
      throw db_error;
    }
  },
  
  /**
   * Find tournament by ID
   * @param {string} id Tournament ID
   * @returns {Object|null} Tournament or null if not found
   */
  async findById(id: string) {
    try {
      const stmt = db.prepare('SELECT * FROM tournaments WHERE id = ?');
      return stmt.get(Number(id)) || null;
    } catch (db_error) {
      throw db_error;
    }
  },

  /**
   * Find match by ID
   * @param {string} id Match ID
   * @returns {Object|null} Match or null if not found
   */
  async findMatchById(id: string) {
    try {
      const stmt = db.prepare('SELECT * FROM matches WHERE id = ?');
      return stmt.get(Number(id)) || null;
    } catch (db_error) {
      throw db_error;
    }
  },
  
  /**
   * Add new player to tournament lobby
   * @param {string} id Tournament ID
   * @param {string} newPlayerId Another player's ID
   * @returns {string} PlayerPosition such as player1Id, player2Id, etc.
   */
  async addPlayer(id: string, newPlayerId: string) {
    try {
      const players: { [key: string]: string | null } = db.prepare(`
        SELECT player1Id, player2Id, player3Id, player4Id
        FROM tournaments
        WHERE id = ?
      `).get(id) as { [key: string]: string | null };
      for (const column of ['player1Id', 'player2Id', 'player3Id', 'player4Id']) {
        if (players[column] === null) {
            db.prepare(`UPDATE tournaments SET ${column} = ? WHERE id = ?`).run(newPlayerId, id);
            db.prepare(`INSERT INTO playerTournaments (playerId, tournamentId) VALUES (?, ?)`).run(newPlayerId, id);
            return column;
        }
      }
      throw new Error(`Tournament ${id} is full`);
    } catch (db_error) {
      throw db_error;
    }
  },

  /**
   * Remove player from tournament lobby
   * @param {string} id Tournament ID
   * @param {string} playerId Player ID
   */
  async removePlayer(id: string, playerId: string) {
    try {
      const players: { [key: string]: string | null } = db.prepare(`
        SELECT player1Id, player2Id, player3Id, player4Id
        FROM tournaments
        WHERE id = ?
      `).get(id) as { [key: string]: string | null };

      let columnToUnset: string | null = null;
      for (const column of ['player1Id', 'player2Id', 'player3Id', 'player4Id']) {
          if (players[column] === playerId) {
              columnToUnset = column;
              break;
          }
      }
      if (!columnToUnset) {
        console.error(`Player ID ${playerId} not found in tournament ${id}`);
        throw new Error(`Player ID ${playerId} not found in tournament ${id}`);
      }
      db.prepare(`UPDATE tournaments SET ${columnToUnset} = NULL WHERE id = ?`).run(id);
      db.prepare(`DELETE FROM playerTournaments WHERE playerId = ?`).run(playerId);
    } catch (db_error) {
      throw db_error;
    }
  },

  /**
   * Add an empty match to be played
   * @param {string} id Tournament ID
   * @param {string} matchName matchSemifinale1 | matchSemifinale2 | matchFinale | matchBronze
   * @param {string} player1Id Player1 ID
   * @param {string} player2Id Player2 ID
   * @returns {string} The newly created Match ID
   */
  async scheduleMatch(id: string, matchName: string, player1Id: string, player2Id: string) {
    try {
      let stmtMtch;
      let resultMtch;
      if (!player2Id) {
        stmtMtch = db.prepare(
          `INSERT INTO matches (player1Id)
          VALUES (?)`
          );
        resultMtch = stmtMtch.run(player1Id);
      }
      else {
        stmtMtch = db.prepare(
          `INSERT INTO matches (player1Id, player2Id)
          VALUES (?, ?)`
          );
        resultMtch = stmtMtch.run(player1Id, player2Id);
      }
      db.prepare(`UPDATE tournaments SET ${matchName}Id = ? WHERE id = ?`).run(resultMtch.lastInsertRowid.toString(), id);
      return resultMtch.lastInsertRowid.toString();
    } catch (db_error) {
      throw db_error;
    }
  },

  async addOpponentToMatch(id: string, matchId: string, matchName: string, player2Id: string) {
    try {
      db.prepare(`UPDATE matches SET player2Id = ? WHERE id = ?`).run(player2Id, matchId);
      db.prepare(`UPDATE tournaments SET ${matchName} = ? WHERE id = ?`).run(matchId, id);
    } catch (db_error) {
      throw db_error;
    }
  },

  /**
   * Store match score
   * @param {string} id Match ID 
   * @param {string} player1Score 
   * @param {string} player2Score
   * @returns {boolean} True if match score was updated
   */
  async updateMatchScore(id: string, player1Score: string, player2Score: string) {
    try {
      const stmt = db.prepare(`UPDATE matches SET player1_score = ?, player2_score = ? WHERE id = ?`)
      const result = stmt.run(player1Score, player2Score, id);
      return result.changes > 0;
    } catch (db_error) {
      throw db_error;
    }
  },

  /**
   * Delete match by ID
   * @param {string} id Match ID
   * @returns {boolean} True if match was deleted
   */
  async deleteMatch(id: string) {
    try {
      const stmt = db.prepare('DELETE FROM matches WHERE id = ?');
      const result = stmt.run(id);
      return result.changes > 0;
    } catch (db_error) {
      throw db_error;
    }
  },

  /**
   * Get the sole tournament that the player is in
   * @param {string} playerId Player ID
   * @returns {Object|null} TournamentId or null if not found
   */
  async getPlayerTournamentId(playerId: string) {
    try {
      return db.prepare(`SELECT tournamentId FROM playerTournaments WHERE playerId = ?`).get(playerId) || null;
    } catch (db_error) {
      throw db_error;
    }
  },
  
  /**
   * Get all tournaments
   * @returns {Array} List of tournaments
   */
  async findAll() {
    try {
      const stmt = db.prepare('SELECT * FROM tournaments');
      return stmt.all();
    } catch (db_error) {
      throw db_error;
    }
  },

  async updateOngoingTournamentDatabase(player1Score: number, player2Score: number, createdAt: string, matchId: string) {
    console.log("update ongoing Tournaments db");
    try {
      db.prepare(`UPDATE matches SET player1Score=?, player2Score=?, playedAt=? WHERE id=?`)
      .run(player1Score, player2Score, createdAt, matchId);
    } catch (db_error) {
      throw db_error;
    }
  }

};

export { Tournament };
