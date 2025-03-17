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
} as const;

export { de };
