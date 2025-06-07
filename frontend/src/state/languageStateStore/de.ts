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
    publicMatches: "Öffentliche Spiele",
    privateMatches: "Private Spiele",
    tournamentMatches: "Turnierspiele",
    yourOwnMatchHeading: "Dein eigenes Spiel",
    createMatch: "Spiel erstellen",
    closeMatchButton: "Spiel schließen",
    join: "Beitreten",
    match: "Spiel",
    matchMaking: "Matchmaking",
    noMatchesAvailable: "Keine Spiele verfügbar!",
    yourMatch: "Dein Spiel",
    tournaments: "Turniere",
    createTournament: "Turnier erstellen",
  },
  register: {
    title: "Registrieren",
    email: "E-Mail",
    displayName: "Anzeigename",
    password: "Passwort",
    confirmPassword: "Passwort bestätigen",
    submit: "Registrieren",
    alreadyRegistered: "Bereits registriert? Hier einloggen",
    submitLogin: "Einloggen",
    notregistered: "Noch nicht registriert? Hier registrieren",
    testUsers: "Testnutzer registrieren",
    passwordRuleMinLength: "Mindestens 8 Zeichen",
    passwordRuleMaxLength: "Maximal 256 Zeichen",
    passwordRuleUppercase: "Mindestens ein Großbuchstabe",
    passwordRuleLowercase: "Mindestens ein Kleinbuchstabe",
    passwordRuleDigit: "Mindestens eine Zahl",
    passwordRuleSpecialChar: "Mindestens ein Sonderzeichen",
    errorPasswordMismatch: "Passwörter stimmen nicht überein",
    success: "Registrierung erfolgreich!",
    save: "Speichern",
    reset: "Zurücksetzen",
    matchHistory: "Spielverlauf",
    friends: "Freunde",
    profilePicture: "Profilbild",
    imageUpdateSuccess: "Profilbild erfolgreich aktualisiert!",
    imageUpdateFail: "Profilbild konnte nicht aktualisiert werden! Grund:",
    fileTooBig:
      "Die ausgewählte Datei ist zu groß! Bitte eine Datei kleiner als 4 MB wählen!",
    invalidFileFormat:
      "Nur Dateien mit den Endungen 'jpg' oder 'png' sind erlaubt!",
    emailUpdateSuccess: "E-Mail erfolgreich aktualisiert!",
    emailUpdateFail: "E-Mail konnte nicht aktualisiert werden!",
    passwordUpdateSuccess: "Passwort erfolgreich aktualisiert!",
    passwordUpdateFail: "Passwort konnte nicht aktualisiert werden!",
    displayNameUpdateSuccess: "Anzeigename erfolgreich aktualisiert!",
    displayNameUpdateFail: "Anzeigename konnte nicht aktualisiert werden!",
    tournament: "Turnier",
    clickToChangeProfilePicture: "Klicken, um das Profilbild zu ändern",
  },
  manageMatch: {
    waitingServerStart: "Warten auf den Serverstart...",
    cancelKeyInstruction: "Drücke 'n', um das Spiel abzubrechen",
    readyKeyInstruction: "Drücke 'y', wenn du bereit bist",
    gameEndsMap: {
      normalMaxScoreReached: "Die maximale Punktzahl wurde erreicht!",
      playerDisconnected: "Ein Spieler hat die Verbindung getrennt!",
      playerLeftGame: "Ein Spieler hat das Spiel verlassen!",
      serverError: "Ein Serverfehler ist aufgetreten!",
    },
    matchIsOver: matchIsOverMsg,
  },
  currentTournament: {
    title: "Turnierübersicht",
    rankings: "Spieler-Rangliste",
    rank: "Rang",
    name: "Name",
    getDataBtn: "❌ Daten über API abrufen",
    toBeDetermined: "Wird bestimmt",
    player1: "Spieler 1",
    player2: "Spieler 2",
    result: "Ergebnis",
    winner: "Gewinner",
    createGame: "Spiel erstellen",
    waitingForHost: "Warten auf den Host",
    notParticipant: "Das ist nicht dein Spiel!",
    notPartOfAnyTournament: "Sie nehmen derzeit an keinem Turnier teil!",
  },
  oneVOneLocal: {
    player1: "Spieler 1",
    player2: "Spieler 2",
    startGame: "Spiel starten",
    localGameOnSame: "Lokales Spiel auf derselben Tastatur",
    aIOrHumanBtnHuman: "Menschlicher Gegner",
    aIOrHumanBtnAi: "KI-Gegner",
    enterPlayer2NamePlaceholder: "Name von Spieler 2 eingeben",
  },
  userSettings: {
    userSettings: "Benutzereinstellungen",
    displayName: "Anzeigename",
    email: "E-Mail",
    save: "Speichern",
    password: "Passwort",
    matchHistoryCaption: "Spielverlauf",
    oponentLocal: "Lokales Spiel gegen",
    oponentRemote: "Online-Spiel gegen",
    loss: "Niederlage",
    win: "Sieg",
    tournamentHistoryCaption: "Turnierverlauf",
    ranking: "Rangliste",
    semifinale: "Halbfinale",
    bronzeMatch: "Spiel um Platz 3",
    finale: "Finale",
    score: "Ergebnis",
    first: "1.",
    second: "2.",
    third: "3.",
    fourth: "4.",
    statsCaption: "Spielstatistiken gegen registrierte Benutzer",
    wins: "Siege",
    losses: "Niederlagen",
    winPercentage: "Siegquote",
    lossPercentage: "Niederlagenquote",
  },
  tournamentItem: {
    tournamentId: "Turnier-ID",
    player1: "Spieler 1",
    player2: "Spieler 2",
    player3: "Spieler 3",
    player4: "Spieler 4",
    join: "Beitreten",
    leave: "Verlassen",
    freeSpot: ">frei<",
  },
  matchItem: {
    matchId: "Spiel-ID",
    gameOf: "Spiel von",
    waitingForOpponent: "Warten auf einen Gegner!",
    typeOfGame: "Spieltyp",
    join: "Beitreten",
    gameRunning: "Spiel läuft",
  },
  chat: {
    tabs: {
      users: "Benutzer",
      blocked: "Blockierte",
      friendRequests: "Freundschafts-anfragen",
    },
    sections: {
      notifierBots: "Benachrichtigungen",
      friends: "Freunde",
      online: "Online",
      offline: "Offline",
      blockedUsers: "Blockierte Benutzer",
      answerRequired: "Antwort erforderlich",
      ownPending: "Ausstehend",
    },
    buttons: {
      sendMessage: "Nachricht senden",
      blockUser: "Benutzer blockieren",
      unblockUser: "Blockierung aufheben",
      acceptRequest: "Annehmen",
      declineRequest: "Ablehnen",
      withdrawRequest: "Anfrage zurückziehen",
      pending: "Ausstehend",
      goToGameArea: "Zum Spielbereich gehen",
    },
    placeholders: {
      searchUsers: "Benutzer suchen...",
      typeMessage: "Gib deine Nachricht hier ein...",
    },
    notifications: {
      userBlocked: "Benutzer erfolgreich blockiert.",
      userUnblocked: "Benutzer erfolgreich entblockt.",
      friendRequestAccepted: "Freundschaftsanfrage angenommen",
      friendRequestDeclined: "Freundschaftsanfrage abgelehnt",
      friendRequestWithdrawn: "Freundschaftsanfrage zurückgezogen",
      friendRequestSend: "Freundschaftsanfrage gesendet",
      friendRequestUnfriend: "Hat dich entfreundet",
      invite: "Der Benutzer hat Sie zu einem Spiel eingeladen\nKlicken Sie hier, um beizutreten",
      inviteNotification: "Der Benutzer hat Sie zu einem Spiel eingeladen",
      tournamentStart: "Das Turnier hat begonnen. Wenn du der Gastgeber bist, gehe zu „Turniere“, um das Spiel zu planen, oder warte auf die Einladung des Gastgebers.",
      matchResult: "${winner} hat das ${type}-Spiel gegen ${loser} mit ${winnerScore} zu ${loserScore} gewonnen.\n",
      playerLeft: "${Player} hat das Turnier verlassen, alle Spiele mit ${Player2} werden automatisch entschieden",
    }
  }
} as const;

function matchIsOverMsg(data: {
  name1: string;
  name2: string;
  score1: number;
  score2: number;
  winner: string;
  reasonString: string;
}) {
  return `
  <div class="flex justify-center items-center">
   <div class="grid grid-cols-2 grid-rows-4 w-96">
      <div class="text-left h-6">${data.name1}:</div>
      <div class="text-left h-6"> ${data.score1}</div>
      <div class="text-left h-6">${data.name2}:</div>
      <div class="text-left h-6"> ${data.score2}</div>
      <div class="text-left h-6">Gewinner:</div>
      <div class="text-left h-6">${data.winner}</div>
      <div class="text-left h-6">Spiel-Ende-Grund: </div>
      <div class="text-left h-6">${data.reasonString}</div>
    </div>
  </div>
  `;
}


export { de };
