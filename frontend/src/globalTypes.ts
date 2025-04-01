import { Store } from "./state/store";

declare global {
    interface Window {
     store: Store;
     colog: (any: any) => void;
     jlog: (any: any) => void;
     brepo: (msg: any) => void;
    }
  }