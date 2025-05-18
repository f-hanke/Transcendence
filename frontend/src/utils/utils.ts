import {
  ChatServiceTypes,
  isDefined,
  transNetworkSettings,
} from "transcendence";
import { RouteBuilder } from "./utilsTypes";

function deepCopyObj<T extends object>(obj: T): T {
  return JSON.parse(JSON.stringify(obj));
}

function createHtmlElementFromString(htmlString: string) {
  const template = document.createElement("template");
  template.innerHTML = htmlString;
  return template.content.firstElementChild as HTMLElement;
}

async function convertToBase64(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = reject;
  });
}

function brepo(msg?: any) {
  console.log("You ordered a break, her it is .......:D:DXDXD");
  throw new Error(msg);
}

function navigateToSite(newRoute: string) {
  history.pushState({}, "", newRoute);
  window.dispatchEvent(new Event("popstate"));
}

function getMicroservicePrefix(service: RouteBuilder.Service) {
  switch (service) {
    case "gameService":
      return "/GAMESERVICE";
    case "matchmakingService":
      return "/MATCHMAKING";
    case "chatService":
      return "/CHATSERVICE";
    case "authService":
      return "/AUTHENTICATION";
  }
}

function getQueryParam(
  queryData?: RouteBuilder.QueryParameter,
  addClientIdAsQueryParam?: RouteBuilder.AddClientIdAsQueryParam
) {
  if (!isDefined(queryData) && addClientIdAsQueryParam !== true) return "";
  let queryParam = "";
  if (addClientIdAsQueryParam === true) {
    const clientId = window.store.userStore.get().details.id;
    if (isDefined(queryData)) queryData.clientId = clientId;
    else queryData = { clientId: clientId };
  }
  if (isDefined(queryData) && Object.keys(queryData).length > 0) {
    queryParam += `?${new URLSearchParams(queryData).toString()}`;
  }
  return queryParam;
}

function buildWsRoute(optn: {
  service: RouteBuilder.Service;
  route: RouteBuilder.Route;
  queryData?: RouteBuilder.QueryParameter;
  addClientIdAsQueryParam?: RouteBuilder.AddClientIdAsQueryParam;
}) {
  const wsProtocol = location.protocol === "https:" ? "wss" : "ws";
  const hostnameAndPort = location.host;
  const servicePrefix = getMicroservicePrefix(optn.service);
  const queryParam = getQueryParam(
    optn.queryData,
    optn.addClientIdAsQueryParam
  );
  let uri = `${wsProtocol}://${hostnameAndPort}${servicePrefix}${optn.route}${queryParam}`;
  return uri;
}

function buildApiRouteRelative(optn: {
  service: RouteBuilder.Service;
  route: RouteBuilder.Route;
  queryData?: RouteBuilder.QueryParameter;
  addClientIdAsQueryParam?: RouteBuilder.AddClientIdAsQueryParam;
}) {
  let uri = getMicroservicePrefix(optn.service);
  uri += optn.route;
  uri += getQueryParam(optn.queryData, optn.addClientIdAsQueryParam);
  return uri;
}

function buildBackendRoute(optn: {
  websocketOrApi: RouteBuilder.WebsocketOrApi;
  service: RouteBuilder.Service;
  route: RouteBuilder.Route;
  secure?: boolean;
  queryData?: RouteBuilder.QueryParameter;
  addClientIdAsQueryParam?: RouteBuilder.AddClientIdAsQueryParam;
}) {
  const socketOrApiString =
    optn.websocketOrApi === "api"
      ? optn.secure === true
        ? "https"
        : "http"
      : optn.secure === true
      ? "wss"
      : "ws";
  let port: number = -1;
  let ip: string = "";
  switch (optn.service) {
    case "gameService":
      ip = transNetworkSettings.gamePlay.ip;
      port = transNetworkSettings.gamePlay.port;
      break;
    case "matchmakingService":
      ip = transNetworkSettings.gameMatchmaking.ip;
      port = transNetworkSettings.gameMatchmaking.port;
      break;
    case "chatService":
      ip = transNetworkSettings.chatService.ip;
      port = transNetworkSettings.chatService.port;
      break;
    case "authService":
      ip = transNetworkSettings.authService.ip;
      port = transNetworkSettings.authService.port;
      break;
  }
  if (optn.addClientIdAsQueryParam === true) {
    const clientId = window.store.userStore.get().details.id;
    if (isDefined(optn.queryData)) optn.queryData.clientId = clientId;
    else optn.queryData = { clientId: clientId };
  }
  let uri = `${socketOrApiString}://${ip}:${port}${optn.route}`;
  if (isDefined(optn.queryData) && Object.keys(optn.queryData).length > 0) {
    uri += `?${new URLSearchParams(optn.queryData).toString()}`;
  }
  return uri;
}

function roundIntToString(num: number) {
  return `${Math.round(num)}`;
}

function padNumberToString(
  num: number,
  padToLength: number,
  padWith: string = " "
) {
  return `${num}`.padStart(padToLength, padWith);
}

function getCurDateString() {
  return new Date(Date.now()).toISOString();
}

function sanitizeAndCleanInput(input: string): string {
  const entityMap = {
    "&": "&amp;",
    "<": "&lt;",
    ">": "&gt;",
    '"': "&quot;",
    "'": "&#39;",
    "/": "&#x2F;",
    "`": "&#x60;",
    "=": "&#x3D;",
  } as const;

  return String(input).replace(/[&<>"'`=\/]/g, function (s) {
    const typedKey = s as keyof typeof entityMap;
    return entityMap[typedKey];
  });
}

function deepEqual(a: any, b: any) {
  if (a === b) return true;

  if (
    a == null ||
    typeof a !== "object" ||
    b == null ||
    typeof b !== "object"
  ) {
    return false;
  }

  let keysA = Object.keys(a);
  let keysB = Object.keys(b);

  if (keysA.length !== keysB.length) return false;

  for (let key of keysA) {
    if (!keysB.includes(key) || !deepEqual(a[key], b[key])) {
      return false;
    }
  }

  return true;
}

function guessImageTypeFromBuffer(buffer: ChatServiceTypes.BufferLike) {
  let bytes: Uint8Array;

  if (buffer instanceof ArrayBuffer) {
    bytes = new Uint8Array(buffer);
  } else if (buffer.type === "Buffer" && Array.isArray(buffer.data)) {
    bytes = new Uint8Array(buffer.data);
  } else {
    return "unknown";
  }

  const pngSignature = [0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a];
  const jpegSignature = [0xff, 0xd8, 0xff];

  function matchesSignature(sig: number[]): boolean {
    if (bytes.length < sig.length) return false;
    for (let i = 0; i < sig.length; i++) {
      if (bytes[i] !== sig[i]) return false;
    }
    return true;
  }

  if (matchesSignature(pngSignature)) {
    return "image/png";
  }
  if (matchesSignature(jpegSignature)) {
    return "image/jpeg";
  }
  return "unknown";
}

function getImgSrcFromBuffer(
  imageBufferObj: ChatServiceTypes.BufferLike | null
) {
  if (!isDefined(imageBufferObj)) return "";
  const uint8Array = new Uint8Array(imageBufferObj.data);
  const blob = new Blob([uint8Array], {
    type: guessImageTypeFromBuffer(imageBufferObj),
  });
  const url = URL.createObjectURL(blob);
  return url;
}

function fileToBufferLike(file: File): Promise<ChatServiceTypes.BufferLike> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();

    reader.onload = () => {
      const arrayBuffer = reader.result as ArrayBuffer;
      const uint8Array = new Uint8Array(arrayBuffer);
      const bufferLike: ChatServiceTypes.BufferLike = {
        type: "Buffer",
        data: Array.from(uint8Array),
      };
      resolve(bufferLike);
    };

    reader.onerror = () => reject(reader.error);

    reader.readAsArrayBuffer(file);
  });
}

function sleep(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms));
}

export {
  deepCopyObj,
  createHtmlElementFromString,
  convertToBase64,
  navigateToSite,
  buildBackendRoute,
  buildApiRouteRelative,
  brepo,
  roundIntToString,
  padNumberToString,
  getCurDateString,
  buildWsRoute,
  sanitizeAndCleanInput,
  deepEqual,
  guessImageTypeFromBuffer,
  getImgSrcFromBuffer,
  fileToBufferLike,
  sleep
};
