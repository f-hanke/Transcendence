import { GameServiceTypes } from "transcendence";

type LanguageState = {
  navbar: {
    play: string;
    oneV1local: string;
    oneV1remote: string;
    tournament: string;
    messages: string;
    settings: string;
    logout: string;
  };
  matchMaking: {
    match: string;
    matchMaking: string;
    createMatch: string;
    createTournament: string;
    publicMatches: string;
    privateMatches: string;
    tournamentMatches: string;
    tournaments: string;
    yourOwnMatchHeading: string;
    closeMatchButton: string;
    join: string;
    noMatchesAvailable: string;
    yourMatch: string;
  };
  manageMatch: {
    waitingServerStart: string;
    cancelKeyInstruction: string;
    readyKeyInstruction: string;
    matchIsOver: (data: {
      name1: string;
      name2: string;
      score1: number;
      score2: number;
      winner: string;
      reasonString: string;
    }) => string;
    gameEndsMap: Record<GameServiceTypes.PossibleGameEnds, string>;
  };
  currentTournament: {
    title: string;
    rankings: string;
    rank: string;
    name: string;
    getDataBtn: string;
    toBeDetermined: string;
    player1: string;
    player2: string;
    result: string;
    winner: string;
    createGame: string;
    waitingForHost: string;
    notParticipant: string;
    notPartOfAnyTournament: string;
  };
  register: {
    title: string;
    email: string;
    displayName: string;
    password: string;
    confirmPassword: string;
    submit: string;
    alreadyRegistered: string;
    submitLogin: string;
    notregistered: string;
    testUsers: string;
    passwordRuleMinLength: string;
    passwordRuleMaxLength: string;
    passwordRuleUppercase: string;
    passwordRuleLowercase: string;
    passwordRuleDigit: string;
    passwordRuleSpecialChar: string;
    errorPasswordMismatch: string;
    success: string;
    save: string;
    reset: string;
    matchHistory: string;
    friends: string;
    profilePicture: string;
    imageUpdateSuccess: string;
    imageUpdateFail: string;
    fileTooBig: string;
    invalidFileFormat: string;
    emailUpdateSuccess: string;
    emailUpdateFail: string;
    passwordUpdateSuccess: string;
    passwordUpdateFail: string;
    displayNameUpdateSuccess: string;
    displayNameUpdateFail: string;
    tournament: string;
    clickToChangeProfilePicture: string;
  };
  oneVOneLocal: {
    player1: string;
    player2: string;
    aIOrHumanBtnHuman: string;
    aIOrHumanBtnAi: string;
    startGame: string;
    localGameOnSame: string;
    enterPlayer2NamePlaceholder: string;
  };
  userSettings: {
    userSettings: string;
    displayName: string;
    email: string;
    save: string;
    password: string;
    matchHistoryCaption: string;
    score: string;
    oponentRemote: string;
    oponentLocal: string;
    win: string;
    loss: string;
    tournamentHistoryCaption: string;
    ranking: string;
    semifinale: string;
    bronzeMatch: string;
    finale: string;
    first: string;
    second: string;
    third: string;
    fourth: string;
    statsCaption: string;
    wins: string;
    losses: string;
    winPercentage: string;
    lossPercentage: string;
  };
  matchItem: {
    matchId: string;
    gameOf: string;
    waitingForOpponent: string;
    typeOfGame: string;
    join: string;
    gameRunning: string;
  };
  tournamentItem: {
    tournamentId: string;
    player1: string;
    player2: string;
    player3: string;
    player4: string;
    join: string;
    leave: string;
    freeSpot: string;
  };
  chat: {
    tabs: {
      users: string;
      blocked: string;
      friendRequests: string;
    };
    sections: {
      notifierBots: string;
      friends: string;
      online: string;
      offline: string;
      blockedUsers: string;
      answerRequired: string;
      ownPending: string;
    };
    buttons: {
      sendMessage: string;
      blockUser: string;
      unblockUser: string;
      acceptRequest: string;
      declineRequest: string;
      withdrawRequest: string;
      pending: string;
      goToGameArea: string;
    };
    placeholders: {
      searchUsers: string;
      typeMessage: string;
    };
    notifications: {
      userBlocked: string;
      userUnblocked: string;
      friendRequestAccepted: string;
      friendRequestDeclined: string;
      invite: string;
      tournamentStart: string;
      matchResult: string;
      playerLeft: string;
    };
  };
};

type SupportedLanguages = "en" | "de" | "fr";

export type { LanguageState, SupportedLanguages };
