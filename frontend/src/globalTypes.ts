import { Store } from "./state/store";
import { State } from "./state/types";

declare global {
    interface Window {
     store: Store;
    }
  }