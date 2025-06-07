import { MatchMakingTypes } from "./matchmakingTypes";

export  const monitoringEnabled = true;


function isTypedObject(value: unknown): value is { type: string } {
  return (
    typeof value === "object" &&
    value !== null &&
    "type" in value &&
    typeof (value as any).type === "string"
  );
}

function isDefined<T>(value: T | null | undefined): value is T {
  return value !== null && value !== undefined;
}

function generateUniqueId(): string {
  return "id-" + Date.now() + "-" + Math.random().toString(36).substr(2, 9);
}

function colog(any: any) {
  console.log(any);
}

function jlog(any: any) {
  console.log(JSON.stringify(any, null, 2));
}

function tournamentIsEmpty(tournament: MatchMakingTypes.Tournament) {
  return (
    !isDefined(tournament.player1Id) &&
    !isDefined(tournament.player2Id) &&
    !isDefined(tournament.player3Id) &&
    !isDefined(tournament.player4Id)
  );
}

function tournamentIsFull(tournament: MatchMakingTypes.Tournament) {
  return (
    isDefined(tournament.player1Id) &&
    isDefined(tournament.player2Id) &&
    isDefined(tournament.player3Id) &&
    isDefined(tournament.player4Id)
  );
}

function isOwnTournament(
  tournament: MatchMakingTypes.Tournament,
  ownId: string
) {
  return (
    tournament.player1Id === ownId ||
    tournament.player2Id === ownId ||
    tournament.player3Id === ownId ||
    tournament.player4Id === ownId
  );
}

export {
  isTypedObject,
  isDefined,
  generateUniqueId,
  colog,
  jlog,
  tournamentIsEmpty,
  tournamentIsFull,
  isOwnTournament,
};
