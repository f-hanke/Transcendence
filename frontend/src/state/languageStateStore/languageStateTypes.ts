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
};

type SupportedLanguages = "en" | "de";

export type { LanguageState, SupportedLanguages };
