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
  chatService: {
    ip: string;
    port: number;
  };
}

const transNetworkSettings: TransNetworkSettings = {
  // put "0.0.0.0" ervywhere for docker setup
  apiGateway: {
    // ip: "localhost",
    ip: "0.0.0.0",
    port: 8443,
  },
  webserver: {
    ip: "0.0.0.0", // use "0.0.0.0" outside of Docker
    port: 10005, // 10005 inside Docker
  },
  gameMatchmaking: {
    ip: "localhost",
    port: 10002,
  },
  gamePlay: {
    ip: "localhost",
    port: 10003,
  },
  authService: {
    ip: "0.0.0.0", // use "0.0.0.0" outside of Docker
    port: 10004,
  },
  chatService: {
    ip: "localhost",
    port: 10001,
  }
};

export { transNetworkSettings };
