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
  oneVOneLocal: {
    player1: string;
    player2: string;
    aIOrHumanBtnHuman: string;
    aIOrHumanBtnAi: string;
    startGame: string;
    localGameOnSame: string;
  };
  userSettings: {
    userSettings: string;
    displayName: string;
    email: string;
    save: string;
    password: string;
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
    tournamentId: string,
    player1: string,
    player2: string,
    player3: string,
    player4: string,
    join: string,
    leave: string,
    freeSpot: string,
  },
  chat: {
    tabs: {
      users: string;
      blocked: string;
      friendRequests: string;
    };
    sections: {
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
    };
  };
};


type SupportedLanguages = "en" | "de" | "fr";

export type { LanguageState, SupportedLanguages };
