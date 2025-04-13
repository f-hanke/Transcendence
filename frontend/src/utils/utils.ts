import { isDefined, transNetworkSettings } from "transcendence";
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

function buildBackendRoute(optn: {
  websocketOrApi: RouteBuilder.WebsocketOrApi;
  service: RouteBuilder.Service;
  route: RouteBuilder.Route;
  queryData?: RouteBuilder.QueryParameter;
  addClientIdAsQueryParam?: RouteBuilder.AddClientIdAsQueryParam;
}) {
  const socketOrApiString = optn.websocketOrApi === "api" ? "http" : "ws";
  let port: number = -1;
  let ip: string = "";
  switch (optn.service) {
    case "gameService":
      ip = transNetworkSettings.gameService.ip;
      port = transNetworkSettings.gameService.port;
      break;
    case "matchmakingService":
      ip = transNetworkSettings.matchmakingService.ip;
      port = transNetworkSettings.matchmakingService.port;
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
    const clientId = window.store.userStore.get().id;
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

export {
  deepCopyObj,
  createHtmlElementFromString,
  convertToBase64,
  navigateToSite,
  buildBackendRoute,
  brepo,
  roundIntToString,
  padNumberToString,
  getCurDateString
};
