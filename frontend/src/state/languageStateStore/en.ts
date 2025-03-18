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
  },
  oneVOneLocal: {
    player1: "Player 1",
    player2: "Player 2",
    startGame: "Start Game",
    localGameOnSame: "Local Game on same keyboard",
  },
  userSettings: {
    userSettings: "User Settings",
    displayName: "Display Name",
    email: "Email",
    save: "Save",
  }
} as const;

export { en };
