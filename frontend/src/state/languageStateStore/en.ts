import { LanguageState } from "./languageStateTypes";

const en: LanguageState = {
  navbar: {
    play: "Play",
    oneV1local: "1v1 Local",
    oneV1remote: "1v1 Remote",
    tournament: "Tournament",
    messages: "Messages",
    settings: "Settings",
    logout: "Logout",
  },
} as const;

export { en };
