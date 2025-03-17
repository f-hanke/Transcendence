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
  }
};

type SupportedLanguages = "en" | "de";

export type { LanguageState, SupportedLanguages };
