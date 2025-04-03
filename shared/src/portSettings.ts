type PortSettings = {
  matchmakingService: number;
  gameService: number;
  chatService: number;
};

const portSettings: PortSettings = {
  matchmakingService: 3000,
  gameService: 3001,
  chatService: 3002,
};

export { portSettings };

export type { PortSettings };
