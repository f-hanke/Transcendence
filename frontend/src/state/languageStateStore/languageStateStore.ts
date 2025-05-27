import { StoreCallback } from "../types";
import { fr } from "./fr";
import { de } from "./de";
import { en } from "./en";
import { LanguageState, SupportedLanguages } from "./languageStateTypes";

class LanguageStateStore {
  listeners: Set<StoreCallback>;
  state: LanguageState;
  en: LanguageState;
  de: LanguageState;
  fr: LanguageState;
  selectedLanguage: SupportedLanguages;
  constructor() {
    this.en = en;
    this.state = en;
    this.de = de;
    this.fr = fr;
    this.selectedLanguage = "en";
    this.listeners = new Set<StoreCallback>();
  }

  subscribe(callback: StoreCallback): () => void {
    this.listeners.add(callback);
    return () => {
      this.listeners.delete(callback);
    };
  }

  set(language: SupportedLanguages) {
    if (language != this.selectedLanguage) {
      this.selectedLanguage = language;
      this.state = this[language];
      this.listeners.forEach((callback) => callback());
    }
  }

  getSelectedLanguage() {
    return this.selectedLanguage;
  }
}

export { LanguageStateStore };
