

declare namespace GameResultTypes {

    type MatchResult = {
        matchId: string;
        player1Id: string;
        player2Id: string;
        player1Score: string;
        player2Score: string;
        winnerId: string;
        createdAt: string;
    };

    type TournamentResult = {
        tournamentId: string;
        playerRank1Id: string;
        playerRank2Id: string;
        playerRank3Id: string;
        playerRank4Id: string;
        playerRank1Score: string;
        playerRank2Score: string;
        playerRank3Score: string;
        playerRank4Score: string;
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
