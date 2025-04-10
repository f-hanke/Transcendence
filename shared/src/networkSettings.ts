type TransNetworkAddress = {
  port: number;
  ip: string;
};

type TransNetworkSettings = {
  matchmakingService: TransNetworkAddress;
  gameService: TransNetworkAddress;
  chatService: TransNetworkAddress;
  authService: TransNetworkAddress;
};

const transNetworkSettings: TransNetworkSettings = {
  matchmakingService: {
    // ip: "10.15.202.2",
    ip: "localhost",
    port: 3000,
  },
  gameService: {
    // ip: "10.15.202.2",
    ip: "localhost",
    port: 3001
  },
  chatService: {
    ip: "10.15.203.2",
    // ip: "localhost",
    port: 3002
  },
  authService: {
    ip: "10.15.204.2",
    // ip: "localhost",
    port: 8080
  },
};

export { transNetworkSettings };

export type { TransNetworkSettings };
