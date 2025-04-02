import { GameServiceTypes } from "./gameServiceTypes.js";
import { MatchMakingTypes } from "./matchmakingTypes.js";
import { SharedTypes } from "./sharedTypes.js";
import { GameSettings, gameSettings } from "./gameSettings.js";
import { AuthServiceTypes } from "./authTypes.js";
import { ChatServiceTypes } from "./chatTypes.js";

export type {
  AuthServiceTypes,
  GameServiceTypes,
  MatchMakingTypes,
  SharedTypes,
  GameSettings,
  ChatServiceTypes,
};

import {
  isTypedObject,
  isDefined,
  generateUniqueId,
  colog,
  jlog,
} from "./sharedFunctions.js";
import { matchmakingTypeGuards } from "./matchmakingTypes.js";
import { gameServiceTypeGuards } from "./gameServiceTypes.js";

export {
  isTypedObject,
  matchmakingTypeGuards,
  isDefined,
  generateUniqueId,
  colog,
  jlog,
  gameServiceTypeGuards,
  gameSettings,
};
