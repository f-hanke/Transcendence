import { LanguageState } from "./languageStateTypes";

const de: LanguageState = {
  navbar: {
    play: "Spielen",
    oneV1local: "1v1 Lokal",
    oneV1remote: "Matchmaking",
    tournament: "Turnier",
    messages: "Nachrichten",
    settings: "Einstellungen",
    logout: "Ausloggen",
  },
  matchMaking: {
    publicMatches: "Oeffentliche Spiele",
    privateMatches: "Private Spiele",
    tournamentMatches: "Turnierspiele",
    yourOwnMatchHeading: "Dein eigenes Spiel",
    createMatch: "Spiel erstellen",
    closeMatchButton: "Spiel loeschen",
    join: "beitreten",
    match: "Spiel",
    matchMaking: "Matchmaking",
    noMatchesAvailable: "Keine Spiele verfuegbar!",
    yourMatch: "Dein Spiel",
    tournaments: "Turniere",
    createTournament: "Turnier erstellen",
  },
  oneVOneLocal: {
    player1: "Spieler 1",
    player2: "Spieler 2",
    startGame: "Spiel starten",
    localGameOnSame: "Lokales Spiel auf derselben Tastatur",
    aIOrHumanBtnHuman: "Menschlicher Gegner",
    aIOrHumanBtnAi: "KI-Gegner",
  },
  userSettings: {
    userSettings: "Benutzereinstellungen",
    displayName: "Anzeigename",
    email: "Email",
    save: "Speichern",
    password: "Passwort",

  }
} as const;

export { de };
