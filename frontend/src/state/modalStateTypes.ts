import { AllKeyboardKeyCodes } from "../utils/keycodesTypes";


type KeyDownCallback = () => void;
type KeyCallbackMap = Partial<Record<AllKeyboardKeyCodes, KeyDownCallback>>;

type ModalListenerState = {
  open: boolean;
  keyDownCallback: KeyCallbackMap;
  content: string[];
}

export type { ModalListenerState, KeyDownCallback , KeyCallbackMap};
