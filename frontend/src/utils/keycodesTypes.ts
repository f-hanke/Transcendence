type LetterKeys =
  | "KeyA" | "KeyB" | "KeyC" | "KeyD" | "KeyE" | "KeyF" | "KeyG" | "KeyH"
  | "KeyI" | "KeyJ" | "KeyK" | "KeyL" | "KeyM" | "KeyN" | "KeyO" | "KeyP"
  | "KeyQ" | "KeyR" | "KeyS" | "KeyT" | "KeyU" | "KeyV" | "KeyW" | "KeyX"
  | "KeyY" | "KeyZ";

type DigitKeys =
  | "Digit0" | "Digit1" | "Digit2" | "Digit3" | "Digit4"
  | "Digit5" | "Digit6" | "Digit7" | "Digit8" | "Digit9";

type FunctionKeys =
  | "F1" | "F2" | "F3" | "F4" | "F5" | "F6" | "F7" | "F8"
  | "F9" | "F10" | "F11" | "F12";

type ControlKeys =
  | "Escape" | "Tab" | "CapsLock" | "ShiftLeft" | "ShiftRight"
  | "ControlLeft" | "ControlRight" | "AltLeft" | "AltRight"
  | "MetaLeft" | "MetaRight" | "Space" | "Enter" | "Backspace"
  | "Delete" | "Insert" | "Home" | "End" | "PageUp" | "PageDown";

type ArrowKeys = "ArrowUp" | "ArrowDown" | "ArrowLeft" | "ArrowRight";

type NumpadKeys =
  | "Numpad0" | "Numpad1" | "Numpad2" | "Numpad3" | "Numpad4"
  | "Numpad5" | "Numpad6" | "Numpad7" | "Numpad8" | "Numpad9"
  | "NumpadDecimal" | "NumpadEnter" | "NumpadAdd" | "NumpadSubtract"
  | "NumpadMultiply" | "NumpadDivide";

type SpecialCharacterKeys =
  | "Backquote" | "Minus" | "Equal" | "BracketLeft" | "BracketRight"
  | "Backslash" | "Semicolon" | "Quote" | "Comma" | "Period" | "Slash";

type MediaKeys =
  | "MediaPlayPause" | "MediaStop" | "MediaTrackNext"
  | "MediaTrackPrevious" | "VolumeUp" | "VolumeDown" | "VolumeMute";

type SystemKeys = "PrintScreen" | "ScrollLock" | "Pause";

type AllKeyboardKeyCodes =
  | LetterKeys
  | DigitKeys
  | FunctionKeys
  | ControlKeys
  | ArrowKeys
  | NumpadKeys
  | SpecialCharacterKeys
  | MediaKeys
  | SystemKeys;


export type {
   LetterKeys,
   DigitKeys,
   FunctionKeys,
   ControlKeys,
   ArrowKeys,
   NumpadKeys,
   SpecialCharacterKeys,
   MediaKeys,
   SystemKeys,
   AllKeyboardKeyCodes
}