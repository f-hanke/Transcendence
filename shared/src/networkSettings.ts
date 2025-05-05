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
    ip: "localhost",
    // ip: "10.15.204.3",
    port: 3000,
  },
  gameService: {
    // ip: "10.15.204.3",
    ip: "localhost",
    port: 3001
  },
  chatService: {
    ip: "localhost",
    // ip: "10.15.204.1",
    port: 3002
  },
  authService: {
    ip: "localhost",
    // ip: "localhost",
    port: 3003
  },
};

export { transNetworkSettings };

export type { TransNetworkSettings };
