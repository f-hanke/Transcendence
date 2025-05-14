import { LanguageState } from "./languageStateTypes";

const en: LanguageState = {
  navbar: {
    play: "Play",
    oneV1local: "1v1 Local",
    oneV1remote: "Matchmaking",
    tournament: "Tournament",
    messages: "Messages",
    settings: "Settings",
    logout: "Logout",
  },
  matchMaking: {
    publicMatches: "public Matches",
    privateMatches: "private Matches",
    tournamentMatches: "tournament Matches",
    yourOwnMatchHeading: "Your own match",
    createMatch: "Create Match",
    closeMatchButton: "Close Match",
    join: "join",
    match: "Match",
    matchMaking: "Matchmaking",
    noMatchesAvailable: "No matches available!",
    yourMatch: "Your match",
    tournaments: "Tournaments",
    createTournament: "createTournament",
  },
  oneVOneLocal: {
    player1: "Player 1",
    player2: "Player 2",
    startGame: "Start Game",
    localGameOnSame: "Local Game on same keyboard",
    aIOrHumanBtnHuman: "Human Opponent",
    aIOrHumanBtnAi: "AI Opponent",
  },
  userSettings: {
    userSettings: "User Settings",
    displayName: "Display Name",
    email: "Email",
    save: "Save",
    password: "Password",

  }
} as const;

export { en };
