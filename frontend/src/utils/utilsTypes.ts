type ObjAllPropsBoolean<T> = {
  [K in keyof T]: boolean;
};


declare namespace RouteBuilder{
  type WebsocketOrApi = "ws" | "api";
  type Service = "gameService" | "chatService" | "matchmakingService" | "authService";
  type Route = string;
  type QueryParameter = Record<string, string>;
  type AddClientIdAsQueryParam = boolean;
}


export type {
  ObjAllPropsBoolean,
  RouteBuilder
}