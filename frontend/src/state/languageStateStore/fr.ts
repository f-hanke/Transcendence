import { LanguageState } from "./languageStateTypes";
const fr: LanguageState = {
  navbar: {
    play: "Jouer",
    oneV1local: "1v1 Local",
    oneV1remote: "Matchmaking",
    tournament: "Tournoi",
    messages: "Messages",
    settings: "Paramètres",
    logout: "Déconnexion",
  },
  matchMaking: {
    publicMatches: "Matchs publics",
    privateMatches: "Matchs privés",
    tournamentMatches: "Matchs de tournoi",
    yourOwnMatchHeading: "Votre propre match",
    createMatch: "Créer un match",
    closeMatchButton: "Fermer le match",
    join: "Rejoindre",
    match: "Match",
    matchMaking: "Matchmaking",
    noMatchesAvailable: "Aucun match disponible !",
    yourMatch: "Votre match",
    tournaments: "Tournois",
    createTournament: "Créer un tournoi",
  },
  manageMatch: {
    waitingServerStart: "En attente du démarrage du serveur...",
    cancelKeyInstruction: "Appuyez sur 'n' pour annuler la partie",
    readyKeyInstruction: "Appuyez sur 'y' quand vous êtes prêt.e",
    gameEndsMap: {
      normalMaxScoreReached: "Le score maximum a été atteint !",
      playerDisconnected: "Un joueur s'est déconnecté !",
      playerLeftGame: "Un joueur a quitté la partie !",
      serverError: "Une erreur serveur est survenue !",
    },
    matchIsOver: matchIsOverMsg,
  },
  currentTournament: {
    title: "Aperçu du Tournoi",
    rankings: "Classement des Joueurs",
    rank: "Rang",
    name: "Nom",
    getDataBtn: "Récupérer les données via l'API",
    toBeDetermined: "À déterminer",
    player1: "Joueur·euse 1",
    player2: "Joueur·euse 2",
    result: "Résultat",
    winner: "Vainqueur",
    createGame: "Créer la Partie",
    waitingForHost: "En attente de l’hôte",
    notParticipant: "Ce n’est pas votre match !",
    notPartOfAnyTournament: "Vous ne participez actuellement à aucun tournoi !",
  },
  oneVOneLocal: {
    player1: "Joueur·euse 1",
    player2: "Joueur·euse 2",
    startGame: "Démarrer la partie",
    localGameOnSame: "Partie locale sur le même clavier",
    aIOrHumanBtnHuman: "Adversaire humain",
    aIOrHumanBtnAi: "Adversaire IA",
    enterPlayer2NamePlaceholder: "Entrez le nom du·de la joueur·euse 2",
  },
  userSettings: {
    userSettings: "Paramètres utilisateur·rice",
    displayName: "Nom affiché",
    email: "E-mail",
    save: "Enregistrer",
    password: "Mot de passe",
    matchHistoryCaption: "Historique des matchs",
    oponent: "Adversaire",
    loss: "Défaite",
    win: "Victoire",
    tournamentHistoryCaption: "Historique du tournoi",
    ranking: "Classement",
    semifinale: "Demi-finale",
    bronzeMatch: "Match pour la 3ᵉ place",
    finale: "Finale",
    score: "Score",
    first: "1er",
    second: "2e",
    third: "3e",
    fourth: "4e",
    statsCaption: "Statistiques",
    wins: "Victoires",
    losses: "Défaites",
    winPercentage: "Pourcentage de victoires",
    lossPercentage: "Pourcentage de défaites",
  },
  tournamentItem: {
    tournamentId: "ID du tournoi",
    player1: "Joueur·euse 1",
    player2: "Joueur·euse 2",
    player3: "Joueur·euse 3",
    player4: "Joueur·euse 4",
    join: "Rejoindre",
    leave: "Quitter",
    freeSpot: ">libre<",
  },
  matchItem: {
    matchId: "ID du match",
    gameOf: "Partie de",
    waitingForOpponent: "En attente d'un·e adversaire !",
    typeOfGame: "Type de partie",
    join: "Rejoindre",
    gameRunning: "Partie en cours",
  },
  register: {
    title: "Inscription",
    email: "E‑mail",
    displayName: "Nom affiché",
    password: "Mot de passe",
    confirmPassword: "Confirmer le mot de passe",
    submit: "S'inscrire",
    submitLogin: "Se connecter",
    notregistered: "Pas encore de compte? S'inscrire",
    alreadyRegistered: "Déjà inscrit·e ? Se connecter",
    testUsers: "Connexion en tant que test_user_{n}",
    passwordRuleMinLength: "Doit comporter au moins 8 caractères",
    passwordRuleMaxLength: "Ne doit pas dépasser 256 caractères",
    passwordRuleUppercase: "Doit contenir au moins une lettre majuscule",
    passwordRuleLowercase: "Doit contenir au moins une lettre minuscule",
    passwordRuleDigit: "Doit contenir au moins un chiffre",
    passwordRuleSpecialChar: "Doit contenir au moins un caractère spécial",
    errorPasswordMismatch:
      "Le mot de passe ne correspond pas à la confirmation !",
    success: "Inscription réussie ! Redirection vers la page de connexion...",
    save: "Enregistrer",
    reset: "Réinitialiser",
    matchHistory: "Historique des matchs",
    friends: "Amis",
    profilePicture: "Photo de profil",
    imageUpdateSuccess: "Photo de profil mise à jour avec succès !",
    imageUpdateFail: "Erreur de mise à jour de la photo : ",
    fileTooBig:
      "Le fichier est trop volumineux ! Veuillez sélectionner un fichier inférieur à 4 Mo.",
    invalidFileFormat:
      "Seuls les fichiers de format 'jpg' ou 'png' sont supportés !",
    emailUpdateSuccess: "E‑mail mis à jour avec succès !",
    emailUpdateFail: "Erreur lors de la mise à jour de l'e‑mail : ",
    passwordUpdateSuccess: "Mot de passe mis à jour avec succès !",
    passwordUpdateFail: "Erreur lors de la mise à jour du mot de passe : ",
    displayNameUpdateSuccess: "Nom d'affichage mis à jour avec succès !",
    displayNameUpdateFail:
      "Erreur lors de la mise à jour du nom d'affichage : ",
    clickToChangeProfilePicture: "Cliquez pour changer la photo de profil",
    tournament: "Tournoi",
  },

  chat: {
    tabs: {
      users: "Utilisateur·rice ",
      blocked: "Bloqué·es",
      friendRequests: "Demandes d'amis",
    },
    sections: {
      notifierBots: "Notifications",
      friends: "Ami·es",
      online: "En ligne",
      offline: "Hors ligne",
      blockedUsers: "Utilisateur·rices  bloqué·es",
      answerRequired: "Réponse requise",
      ownPending: "En attente",
    },
    buttons: {
      sendMessage: "Envoyer un message",
      blockUser: "Bloquer l'utilisateur·rice",
      unblockUser: "Débloquer l'utilisateur·rice",
      acceptRequest: "Accepter",
      declineRequest: "Refuser",
      withdrawRequest: "Retirer la demande",
      pending: "En attente",
      goToGameArea: "Aller à l'aire de jeu",
    },
    placeholders: {
      searchUsers: "Rechercher des utilisateur·rice...",
      typeMessage: "Tapez votre message ici...",
    },
    notifications: {
      userBlocked: "utilisateur·rice  bloqué·e avec succès.",
      userUnblocked: "utilisateur·rice  débloqué·e avec succès.",
      friendRequestAccepted: "Demande d'ami acceptée.",
      friendRequestDeclined: "Demande d'ami refusée.",
      invite:
        "L'utilisateur vous a invité à jouer une partie avec lui\nCliquez ici pour rejoindre.",
      tournamentStart:
        "Le tournoi a commencé. Si vous êtes l’hôte, allez dans « Tournois » pour programmer le match ou attendez que l’hôte vous envoie une invitation.",
      matchResult:
        "${winner} a remporté le match ${type} contre ${loser} avec un score de ${winnerScore} à ${loserScore}.\n",
      playerLeft:
        "${Player} a quitté le tournoi, tous les matchs avec lui seront automatiquement résolus",
    },
  },
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
      <div class="text-left h-6">Gagnant:</div>
      <div class="text-left h-6">${data.winner}</div>
      <div class="text-left h-6">Raison de fin:</div>
      <div class="text-left h-6">${data.reasonString}</div>
    </div>
  </div>
  `;
}

export { fr };
