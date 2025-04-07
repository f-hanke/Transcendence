type TransNetworkAddress = {
  port: number;
  ip: string;
};

type TransNetworkSettings = {
  matchmakingService: TransNetworkAddress;
  gameService: TransNetworkAddress;
  chatService: TransNetworkAddress;
};

const transNetworkSettings: TransNetworkSettings = {
  matchmakingService: {
    ip: "10.15.202.2",
    port: 3000,
  },
  gameService: {
    ip: "10.15.202.2",
    port: 3001
  },
  chatService: {
    ip: "localhost",
    port: 3002
  },
};

export { transNetworkSettings };

export type { TransNetworkSettings };
