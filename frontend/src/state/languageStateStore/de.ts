import { LanguageState } from "./languageStateTypes";

const de: LanguageState = {
  navbar: {
    play: "Spielen",
    oneV1local: "1v1 Lokal",
    oneV1remote: "1v1 Netzwerk",
    tournament: "Turnier",
    messages: "Nachrichten",
    settings: "Einstellungen",
    logout: "Ausloggen",
  },
  matchMaking: {
    availableMatches: "Verfuegbare Spiele",
    createMatch: "Spiel erstellen",
    join: "beitreten",
    match: "Spiel",
    matchMaking: "Matchmaking",
    noMatchesAvailable: "Keine Spiele verfuegbar!",
    yourMatch: "Dein Spiel"
  }
} as const;

export { de };
