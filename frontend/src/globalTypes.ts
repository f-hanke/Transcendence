import { Store } from "./state/store";

declare global {
    interface Window {
     store: Store;
    }
  }