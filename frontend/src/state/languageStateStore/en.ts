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
  matchMaking: {
    availableMatches: "Available Matches",
    createMatch: "Create Match",
    join: "join",
    match: "Match",
    matchMaking: "Matchmaking",
    noMatchesAvailable: "No matches available!",
    yourMatch: "Your match"
  }
} as const;

export { en };
