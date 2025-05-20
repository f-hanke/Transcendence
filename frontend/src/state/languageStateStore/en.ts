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
    publicMatches: "Public Matches",
    privateMatches: "Private Matches",
    tournamentMatches: "Tournament Matches",
    yourOwnMatchHeading: "Your own match",
    createMatch: "Create Match",
    closeMatchButton: "Close Match",
    join: "Join",
    match: "Match",
    matchMaking: "Matchmaking",
    noMatchesAvailable: "No matches available!",
    yourMatch: "Your match",
    tournaments: "Tournaments",
    createTournament: "Create Tournament",
  },
  oneVOneLocal: {
    player1: "Player 1",
    player2: "Player 2",
    startGame: "Start Game",
    localGameOnSame: "Local game on same keyboard",
    aIOrHumanBtnHuman: "Human Opponent",
    aIOrHumanBtnAi: "AI Opponent",
  },
  userSettings: {
    userSettings: "User Settings",
    displayName: "Display Name",
    email: "Email",
    save: "Save",
    password: "Password",
  },
  chat: {
    tabs: {
      users: "Users",
      blocked: "Blocked",
      friendRequests: "Friend Requests",
    },
    sections: {
      friends: "Friends",
      online: "Online",
      offline: "Offline",
      blockedUsers: "Blocked Users",
      answerRequired: "Answer Required",
      ownPending: "Own Pending",
    },
    buttons: {
      sendMessage: "Send Message",
      blockUser: "Block User",
      unblockUser: "Unblock User",
      acceptRequest: "Accept",
      declineRequest: "Decline",
    },
    placeholders: {
      searchUsers: "Search users...",
      typeMessage: "Type your message here...",
    },
    notifications: {
      userBlocked: "User blocked successfully.",
      userUnblocked: "User unblocked successfully.",
      friendRequestAccepted: "Friend request accepted.",
      friendRequestDeclined: "Friend request declined.",
    }
  }
} as const;

export { en };
