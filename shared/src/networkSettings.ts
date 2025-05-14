type TransNetworkAddress = {
  port: number;
  ip: string;
};

type TransNetworkSettings = {
  matchmakingService: TransNetworkAddress;
  gameService: TransNetworkAddress;
  chatService: TransNetworkAddress;
  authService: TransNetworkAddress;
  webserver: TransNetworkAddress;
  apiGateway: TransNetworkAddress;
};

const transNetworkSettings: TransNetworkSettings = {
  apiGateway: {
    ip: "0.0.0.0",
    port: 8443,
  },
  matchmakingService: {
    // ip: "10.15.106.2",
    ip: "localhost",
    port: 10001,
  },
  gameService: {
    ip: "localhost",
    port: 10002,
  },
  chatService: {
    ip: "localhost",
    port: 10003
  },
  authService: {
    ip: "localhost",
    port: 10004
  },
  webserver: {
    ip: "0.0.0.0",
    port: 10005
  },
};

export { transNetworkSettings };

export type { TransNetworkSettings };
