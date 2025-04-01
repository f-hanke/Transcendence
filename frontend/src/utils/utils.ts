import { isDefined } from "transcendence";
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

function brepo(msg?: any)
{
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
  let ip = import.meta.env.VITE_BACKEND_IP;
  let port;
  switch (optn.service) {
    case "gameService":
      port = import.meta.env.VITE_PORT_GAME_SERVICE;
      break;
    case "matchmakingService":
      port = import.meta.env.VITE_PORT_MATCHMAKING_SERVICE;
      break;
    case "chatService":
      port = import.meta.env.VITE_PORT_CHAT_SERVICE;
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

export {
  deepCopyObj,
  createHtmlElementFromString,
  convertToBase64,
  navigateToSite,
  buildBackendRoute,
  brepo
};
