export interface TransNetworkSettings {
  apiGateway: {
    ip: string;
    port: number;
  };
  webserver: {
    ip: string;
    port: number;
  };
  gameMatchmaking: {
    ip: string;
    port: number;
  };
  gamePlay: {
    ip: string;
    port: number;
  };
  authService: {
    ip: string;
    port: number;
  };
}

const transNetworkSettings: TransNetworkSettings = {
  apiGateway: {
    ip: "0.0.0.0",
    port: 8443,
  },
  webserver: {
    ip: "0.0.0.0", // use "localhost" outside of Docker
    port: 10005, // 10005 inside Docker
  },
  gameMatchmaking: {
    ip: "0.0.0.0",
    port: 10002,
  },
  gamePlay: {
    ip: "0.0.0.0",
    port: 10003,
  },
  authService: {
    ip: "0.0.0.0", // use "localhost" outside of Docker
    port: 10004,
  }
};

export { transNetworkSettings };
