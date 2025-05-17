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
        id: string;
        player1Id: string;
        player2Id: string;
        player1Score: number;
        player2Score: number;
        winnerId: string;
        createdAt: string;
    };

    type RawDBRecordTournamentResult = {
        id: string;
        rank1PlayerId: string;
        rank2PlayerId: string;
        rank3PlayerId: string;
        rank4PlayerId: string;
        matchSemifinale1Id: string;
        matchSemifinale2Id: string;
        matchFinaleId: string;
        matchBronzeId: string;
        createdAt: string;
    };
}

function isMatchResult(obj: any): obj is GameResultTypes.MatchResult {
    return (
        obj.matchId !== undefined && typeof obj.matchId === "string" &&
        obj.player1Id !== undefined && typeof obj.player1Id === "string" &&
        obj.player2Id !== undefined && typeof obj.player2Id === "string" &&
        obj.player1Score !== undefined && typeof obj.player1Score === "number" &&
        obj.player2Score !== undefined && typeof obj.player2Score === "number" &&
        obj.winnerId !== undefined && typeof obj.winnerId === "string" &&
        obj.createdAt !== undefined && typeof obj.createdAt === "string"
    );
}

function isTournamentResult(obj: any): obj is GameResultTypes.TournamentResult {
    return (
        obj.tournamentId !== undefined && typeof obj.tournamentId === "string" &&
        obj.rank1PlayerId !== undefined && typeof obj.rank1PlayerId === "string" &&
        obj.rank2PlayerId !== undefined && typeof obj.rank2PlayerId === "string" &&
        obj.rank3PlayerId !== undefined && typeof obj.rank3PlayerId === "string" &&
        obj.rank4PlayerId !== undefined && typeof obj.rank4PlayerId === "string" &&
        obj.matchSemifinale1 !== undefined && typeof obj.matchSemifinale1 === "object" &&
        obj.matchSemifinale2 !== undefined && typeof obj.matchSemifinale2 === "object" &&
        obj.matchFinale !== undefined && typeof obj.matchFinale === "object" &&
        obj.matchBronze !== undefined && typeof obj.matchBronze === "object" &&
        obj.createdAt !== undefined && typeof obj.createdAt === "string"
    );
}

const gameResultTypeGuards = {
    isMatchResult,
    isTournamentResult
} as const;

export { GameResultTypes, gameResultTypeGuards };
