import { MatchMakingTypes } from "./matchmakingTypes";
type BasicGame = MatchMakingTypes.BasicGame;

declare namespace GameResultTypes {

    type MatchResult = {
        matchId: string;
        player1Id: string;
        player2Id: string;
        player1Score: number;
        player2Score: number;
        winnerId: string;
        createdAt: string;
    };

    type TournamentResult = {
        tournamentId: string;
        rank1PlayerId: string;
        rank2PlayerId: string;
        rank3PlayerId: string;
        rank4PlayerId: string;
        matchSemifinale1: MatchResult;
        matchSemifinale2: MatchResult;
        matchFinale: MatchResult;
        matchBronze: MatchResult;
        createdAt: string;
    };

    type RawDBRecordMatchResult = {
        id: number;
        player1Id: number;
        player2Id: number;
        player1Score: number;
        player2Score: number;
        winnerId: number;
        createdAt: string;
    };

    type RawDBRecordTournamentResult = {
        id: number;
        rank1PlayerId: number;
        rank2PlayerId: number;
        rank3PlayerId: number;
        rank4PlayerId: number;
        matchSemifinale1Id: number;
        matchSemifinale2Id: number;
        matchFinaleId: number;
        matchBronzeId: number;
        createdAt: string;
    };
}

function isMatchResult(obj: any): obj is GameResultTypes.MatchResult {
    return (
        typeof obj.matchId === "string" &&
        typeof obj.player1Id === "string" &&
        typeof obj.player2Id === "string" &&
        typeof obj.player1Score === "string" &&
        typeof obj.player2Score === "string" &&
        typeof obj.winnerId === "string" &&
        typeof obj.createdAt === "string"
    );
}

function isTournamentResult(obj: any): obj is GameResultTypes.TournamentResult {
    return (
        typeof obj.tournamentId === "string" &&
        typeof obj.playerRank1Id === "string" &&
        typeof obj.playerRank2Id === "string" &&
        typeof obj.playerRank3Id === "string" &&
        typeof obj.playerRank4Id === "string" &&
        typeof obj.playerRank1Score === "string" &&
        typeof obj.playerRank2Score === "string" &&
        typeof obj.playerRank3Score === "string" &&
        typeof obj.playerRank4Score === "string" &&
        typeof obj.createdAt === "string"
    );
}

const gameResultTypeGuards = {
    isMatchResult,
    isTournamentResult
} as const;

export { GameResultTypes, gameResultTypeGuards };
