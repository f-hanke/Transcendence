declare namespace GameServiceTypes {
  type StaticGameProperties = {
    typeOfGame: "localPvP" | "localPvAi" | "remote";
    matchId: string;
    hostId: string;
    oponentId: string;
  };

  type PossibleGameEnds =
    | "normalMaxScoreReached"
    | "playerLeftGame"
    | "playerDisconnected"
    | "serverError";

  type Ball = {
    x: number;
    y: number;
  };

  type PlayerPaddleScore = {
    id: string;
    paddleY: number;
    score: number;
  };

  type DataClientIsReady = {
    clientId: string;
    matchId: string;
  };

  type UpdatePlayerPaddle = {
    playerId: string;
    paddleY: number;
    paddleSpeed: 0 | 1 | -1;
  };



  type DataClientUpdatePaddlePosition = {
    matchId: string;
    player1: UpdatePlayerPaddle;
    player2: UpdatePlayerPaddle | null;
    //ball: Ball;
  };

  type DataClientLeftGame = {
    matchId: string;
    playerId: string;
  };

  type DataServerGameStarted = {
    matchId: string;
  };

  type DataServerUpdateGameState = {
    matchId: string;
    player1: PlayerPaddleScore;
    player2: PlayerPaddleScore;
    ball: Ball;
  };

  type DataServerGameIsOver = {
    matchId: string;
    player1: {
      id: string;
      score: number;
    };
    player2: {
      id: string;
      score: number;
    };
    reason: PossibleGameEnds;
  };

  type DataServerError = {
    errorMessage: string;
  };

  type GameServiceMessageTypes =
    | "clientUpdatePaddlePosition"
    | "clientLeftGame"
    | "clientIsReady"
    | "serverGameStarted"
    | "serverUpdateGameState"
    | "serverGameIsOver"
    | "serverError";

  interface GameServiceMessageBlueprint<T extends GameServiceMessageTypes> {
    type: T;
  }

  interface ClientIsReady extends GameServiceMessageBlueprint<"clientIsReady"> {
    data: DataClientIsReady;
  }

  interface ClientUpdatePaddlePosition
    extends GameServiceMessageBlueprint<"clientUpdatePaddlePosition"> {
    data: DataClientUpdatePaddlePosition;
  }

  interface ClientLeftGame
    extends GameServiceMessageBlueprint<"clientLeftGame"> {
    data: DataClientLeftGame;
  }

  interface ServerUpdateGameState
    extends GameServiceMessageBlueprint<"serverUpdateGameState"> {
    data: DataServerUpdateGameState;
  }

  interface ServerGameIsOver
    extends GameServiceMessageBlueprint<"serverGameIsOver"> {
    data: DataServerGameIsOver;
  }

  interface ServerGameStarted
    extends GameServiceMessageBlueprint<"serverGameStarted"> {
    data: DataServerGameStarted;
  }

  interface ServerError extends GameServiceMessageBlueprint<"serverError"> {
    data: DataServerError;
  }

  type AllGameServiceMessageTypes =
    | ClientUpdatePaddlePosition
    | ClientLeftGame
    | ClientIsReady
    | ServerUpdateGameState
    | ServerGameIsOver
    | ServerError
    | ServerGameStarted;
}

function isClientUpdatePaddlePosition(
  message: any
): message is GameServiceTypes.ClientUpdatePaddlePosition {
  return (
    message?.type === "clientUpdatePaddlePosition" &&
    message?.data &&
    typeof message.data.matchId === "string" &&
    message.data.player1?.playerId &&
    typeof message.data.player1.paddleY === "number" &&
    (message.data.player1.paddleSpeed === 0 ||
      message.data.player1.paddleSpeed === 1 ||
      message.data.player1.paddleSpeed === -1) &&
    (message.data.player2 === null ||
      (message.data.player2?.playerId &&
        typeof message.data.player2.paddleY === "number" &&
        (message.data.player2.paddleSpeed === 0 ||
          message.data.player2.paddleSpeed === 1 ||
          message.data.player2.paddleSpeed === -1)))
  );
}

function isClientLeftGame(
  message: any
): message is GameServiceTypes.ClientLeftGame {
  return (
    message?.type === "clientLeftGame" &&
    message?.data &&
    typeof message.data.matchId === "string" &&
    typeof message.data.playerId === "string"
  );
}

function isServerUpdateGameState(
  message: any
): message is GameServiceTypes.ServerUpdateGameState {
  return (
    message?.type === "serverUpdateGameState" &&
    message?.data &&
    typeof message.data.matchId === "string" &&
    message.data.player1 &&
    typeof message.data.player1.id === "string" &&
    typeof message.data.player1.score === "number" &&
    typeof message.data.player1.paddleY === "number" &&
    typeof message.data.player1.paddleSpeed === "number" &&
    typeof message.data.player1.paddleSpeed === "number" &&
    message.data.ball &&
    typeof message.data.ball.x === "number" &&
    typeof message.data.ball.y === "number" &&
    (message.data.player2 === null ||
      (message.data.player2 &&
        typeof message.data.player2.id === "string" &&
        typeof message.data.player2.score === "number" &&
        typeof message.data.player2.paddleY === "number"))
  );
}

function isServerGameIsOver(
  message: any
): message is GameServiceTypes.ServerGameIsOver {
  return (
    message?.type === "serverGameIsOver" &&
    message?.data &&
    typeof message.data.matchId === "string" &&
    message.data.player1 &&
    typeof message.data.player1.id === "string" &&
    typeof message.data.player1.score === "number" &&
    message.data.player2 &&
    typeof message.data.player2.id === "string" &&
    typeof message.data.player2.score === "number" &&
    message.data.reason &&
    typeof message.data.reason === "string"
  );
}

function isServerGameStarted(
  message: any
): message is GameServiceTypes.ServerGameStarted {
  return (
    message?.type === "serverGameStarted" &&
    message?.data &&
    typeof message.data.matchId === "string"
  );
}

function isServerError(message: any): message is GameServiceTypes.ServerError {
  return (
    message?.type === "serverError" &&
    message?.data &&
    typeof message.data.errorMessage === "string"
  );
}

function isClientIsReady(
  message: any
): message is GameServiceTypes.ClientIsReady {
  return (
    message?.type === "clientIsReady" &&
    message?.data &&
    typeof message.data.clientId === "string" &&
    typeof message.data.matchId == "string"
  );
}

const gameServiceTypeGuards = {
  isClientUpdatePaddlePosition,
  isClientLeftGame,
  isServerUpdateGameState,
  isServerGameIsOver,
  isServerError,
  isClientIsReady,
  isServerGameStarted,
} as const;

export { GameServiceTypes, gameServiceTypeGuards };
