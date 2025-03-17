import { deepCopyObj } from "../utils/utils";
import { GameState, NotificationState, State, StoreCallback } from "./types";

class Store {
  state: State;
  listeners: Map<string, Set<StoreCallback>>;
  constructor(initialState: State) {
    this.state = initialState;
    this.listeners = new Map<string, Set<StoreCallback>>();
  }

  subscribe(key: keyof State, callback: StoreCallback): () => void {
    if (!this.listeners.has(key)) {
      this.listeners.set(key, new Set());
    }
    this.listeners.get(key)!.add(callback);

    return () => {
      this.listeners.get(key)?.delete(callback);
    };
  }

  updateGameState(newState: GameState) {
    this.state.gameState = deepCopyObj(newState);
    this.listeners.get("gameState")?.forEach((callback) => callback());
  }

  getGameState(): GameState {
    return this.state.gameState;
  }

  updateNotificationState(newState: NotificationState) {
    this.state.notificationState = deepCopyObj(newState);
    console.log("NEW NOTIFICATION STATE");
    console.log(console.log(JSON.stringify(newState, null,2)));
    this.listeners.get("notificationState")?.forEach((callback) => callback());
  }

  getNotificationState(): NotificationState {
    return this.state.notificationState;
  }

  // setState(newState: Partial<State>): void {
  //   Object.keys(newState).forEach((key) => {
  //     const typedKey = key as keyof State;
  //     if (this.state[typedKey] !== newState[typedKey]) {
  //       this.state[typedKey] = newState[typedKey]!;
  //       this.listeners.get(key)?.forEach((callback) => callback(this.state[typedKey]));
  //     }
  //   });
    // console.log("NEW STATE SET");
    // console.log(newState.gameState?.paddleRight);
    // console.log(JSON.stringify(newState, null,2));
  // }

  // 🆕 Async fetch function to update state
  // async fetchState<K extends keyof State>(
  //   key: K,
  //   fetchFunction: () => Promise<State[K]>
  // ): Promise<void> {
  //   try {
  //     const data = await fetchFunction();
  //     this.setState({ [key]: data });
  //   } catch (error) {
  //     console.error(`Failed to fetch ${key}:`, error);
  //   }
  // }


}

export { Store };
