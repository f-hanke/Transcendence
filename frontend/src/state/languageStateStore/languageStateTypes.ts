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
    availableMatches: string;
    join: string;
    noMatchesAvailable: string;
    yourMatch: string;
  },
  oneVOneLocal: {
    player1: string;
    player2: string;
    startGame: string;
    localGameOnSame: string;
  }
};

type SupportedLanguages = "en" | "de";

export type { LanguageState, SupportedLanguages };
