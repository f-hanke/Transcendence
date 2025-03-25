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
    availableMatches: "Verfuegbare andere Spiele",
    yourOwnMatchHeading: "Dein eigenes Spiel",
    createMatch: "Spiel erstellen",
    closeMatchButton: "Spiel loeschen",
    join: "beitreten",
    match: "Spiel",
    matchMaking: "Matchmaking",
    noMatchesAvailable: "Keine Spiele verfuegbar!",
    yourMatch: "Dein Spiel"
  },
  oneVOneLocal: {
    player1: "Spieler 1",
    player2: "Spieler 2",
    startGame: "Spiel starten",
    localGameOnSame: "Lokales Spiel auf derselben Tastatur",
  },
  userSettings: {
    userSettings: "Benutzereinstellungen",
    displayName: "Anzeigename",
    email: "Email",
    save: "Speichern",
  }
} as const;

export { de };
