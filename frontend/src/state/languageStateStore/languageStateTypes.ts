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
  },
  oneVOneLocal: {
    player1: string;
    player2: string;
    aIOrHumanBtnHuman: string;
    aIOrHumanBtnAi: string;
    startGame: string;
    localGameOnSame: string;
  },
  userSettings: {
    userSettings: string;
    displayName: string;
    email: string;
    save: string;
    password: string;
  }
};

type SupportedLanguages = "en" | "de";

export type { LanguageState, SupportedLanguages };
