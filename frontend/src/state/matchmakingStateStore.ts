import {
  isDefined,
  jlog,
  MatchMakingTypes,
  tournamentIsEmpty,
  tournamentIsFull,
} from "transcendence";
import { deepCopyObj } from "../utils/utils";
import {
  MatchMakingMatchGroups,
  MatchmakingState,
} from "./matchmakingStateTypes";
import { StoreCallback } from "./types";

class MatchmakingStateStore {
  listeners: Set<StoreCallback>;
  state: MatchmakingState;
  constructor() {
    this.state = this.init();
    this.listeners = new Set<StoreCallback>();
  }

  init() {
    this.state = {
      ownMatch: null,
      otherMatches: [],
      tournaments: [],
    };
    return this.state;
  }

  updateListenersOnChange() {
    this.listeners.forEach((callback) => callback());
  }

  subscribe(callback: StoreCallback): () => void {
    this.listeners.add(callback);
    return () => {
      this.listeners.delete(callback);
    };
  }

  getMatchGroups(): MatchMakingMatchGroups {
    const groups: MatchMakingMatchGroups = {
      ownMatch: this.state.ownMatch,
      public: [],
      private: [],
      tournament: [],
    };
    this.state.otherMatches.forEach((matchObj) => {
      const curUserIsInvited =
        matchObj.invitedPlayerId === window.store.userStore.get().details.id;
      const matchCopy = deepCopyObj(matchObj);
      if (matchObj.type === "public") groups.public.push(matchCopy);
      else if ((matchObj.type === "private" || matchObj.type === "tournament") && curUserIsInvited)
        groups.private.push(matchCopy);
      else if (matchObj.type === "tournament")
        groups.tournament.push(matchCopy);
      else if (matchObj.type === "private" && !curUserIsInvited) {
      } else throw new Error("User not assigned to any matchmaking-group!");
    });
    return groups;
  }

  createGame(match: MatchMakingTypes.BasicGame) {
    if (match.hostId == window.store.userStore.get().details.id)
    {
      this.state.ownMatch = deepCopyObj(match);
    }
    else this.state.otherMatches.push(deepCopyObj(match));
    this.updateListenersOnChange();
  }

  deleteGame(match: MatchMakingTypes.BasicGame) {
    if (
      isDefined(this.state.ownMatch) &&
      this.state.ownMatch.matchId == match.matchId
    )
      this.state.ownMatch = null;
    else
      this.state.otherMatches = this.state.otherMatches.filter(
        (elem) => elem.matchId !== match.matchId
      );
    this.updateListenersOnChange();
  }

  updateFromAllMatches(allMatches: MatchMakingTypes.ServerUpdateGames["data"]) {
    console.log("UPDATE FROM ALL MATCHES");
    jlog(allMatches);
    const newState: MatchmakingState = {
      otherMatches: [],
      tournaments: deepCopyObj(allMatches.tournaments),
      ownMatch: deepCopyObj(this.state.ownMatch),
    };
    const clientId = window.store.userStore.get().details.id;
    allMatches.basicGames.forEach((match) => {
      if (match.hostId === clientId) newState.ownMatch = match;
      else newState.otherMatches.push(match);
    });
    this.state = deepCopyObj(newState);
    this.updateListenersOnChange();
  }

  updateOneGame(updateMatch: MatchMakingTypes.BasicGame) {
    const game = this.state.otherMatches.find(
      (match) => match.matchId === updateMatch.matchId
    );
    if (isDefined(game)) game.oponentId = updateMatch.oponentId;
    else this.state.otherMatches.push(deepCopyObj(updateMatch));
    this.updateListenersOnChange();
  }

  updateOneTournament(updateTournament: MatchMakingTypes.Tournament) {
    const newTournamentState = this.state.tournaments.filter(
      (tournament) => tournament.tournamentId !== updateTournament.tournamentId
    );
    if (
      tournamentIsEmpty(updateTournament) ||
      tournamentIsFull(updateTournament)
    ) {
      // intentionally do nothing
    } else {
      newTournamentState.push(deepCopyObj(updateTournament));
    }
    this.state.tournaments = newTournamentState;
    this.updateListenersOnChange();
  }

  update(newState: MatchmakingState) {
    this.state = deepCopyObj(newState);
    this.updateListenersOnChange();
  }

  get(): MatchmakingState {
    return this.state;
  }
}

export { MatchmakingStateStore };
