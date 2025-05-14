import { GameServiceTypes } from "./gameServiceTypes.js";
import { MatchMakingTypes } from "./matchmakingTypes.js";
import { SharedTypes } from "./sharedTypes.js";
import { GameSettings, gameSettings } from "./gameSettings.js";
import {
  AuthServiceTypes,
  AuthErrors,
  testUserConfig,
  authServiceTypeGuards,
  authErrorsToMsgMap,
} from "./authTypes.js";
import { ChatServiceTypes } from "./chatTypes.js";
import { GameResultTypes } from "./gameResultTypes.js";
import { RabbitMQTypes } from "./rabbitMQTypes.js";
import {
  TransNetworkSettings,
  transNetworkSettings,
} from "./networkSettings.js";

export type {
  AuthServiceTypes,
  GameServiceTypes,
  MatchMakingTypes,
  SharedTypes,
  GameSettings,
  ChatServiceTypes,
  GameResultTypes,
  RabbitMQTypes,
  TransNetworkSettings,
};

import {
  isTypedObject,
  isDefined,
  generateUniqueId,
  colog,
  jlog,
  tournamentIsEmpty,
  tournamentIsFull,
  isOwnTournament,
} from "./sharedFunctions.js";
import { matchmakingTypeGuards } from "./matchmakingTypes.js";
import { gameServiceTypeGuards } from "./gameServiceTypes.js";
import { chatServiceTypeGuards } from "./chatTypes.js";
import { gameResultTypeGuards } from "./gameResultTypes.js";
import { rabbitMQTypeGuards } from "./rabbitMQTypes.js";

export {
  isTypedObject,
  matchmakingTypeGuards,
  gameResultTypeGuards,
  rabbitMQTypeGuards,
  isDefined,
  generateUniqueId,
  colog,
  jlog,
  gameServiceTypeGuards,
  gameSettings,
  transNetworkSettings,
  chatServiceTypeGuards,
  authServiceTypeGuards,
  AuthErrors,
  authErrorsToMsgMap,
  testUserConfig,
  tournamentIsEmpty,
  tournamentIsFull,
  isOwnTournament,
};
