import { SupportedLanguages } from "../state/languageStateStore/languageStateTypes";

class ChangeLanguageButton extends HTMLElement {
    private changeLanguageBtn: HTMLButtonElement;
    private dropdown: HTMLElement | null = null;
  
    constructor() {
      super();
      this.changeLanguageBtn = this.createChangeLanguageButton();
    }
  
    connectedCallback() {
      this.appendChild(this.changeLanguageBtn);
      this.changeLanguageBtn.addEventListener("click", this.toggleDropdown.bind(this));
      document.addEventListener("click", this.handleClickOutside.bind(this));
    }

    disconnectedCallback() {
        if (this.dropdown) {
          const languageOptions = this.dropdown.querySelectorAll('.language-option');
          languageOptions.forEach((button) => {
            button.removeEventListener('click', this.handleLanguageChange);
          });
          this.dropdown.remove();
        }
        this.changeLanguageBtn.removeEventListener('click', this.toggleDropdown);
        document.removeEventListener("click", this.handleClickOutside);
      }

    private createChangeLanguageButton(): HTMLButtonElement {
      const button = document.createElement('button');
      button.id = "changeLanguageBtn";
      button.className = "fixed top-4 right-4 text-white rounded-full shadow-lg hover:bg-black-600 focus:outline-none text-4xl";
      button.innerHTML = "🌍";
      return button;
    }
  
    private toggleDropdown() {
      if (this.dropdown) {
        this.dropdown.classList.toggle('hidden');
      } else {
        this.createDropdown();
      }
    }
  
    private createDropdown() {
      this.dropdown = document.createElement('div');
      this.dropdown.className = "fixed top-16 right-4 bg-white text-black rounded-lg shadow-lg p-4 w-40 flex flex-col items-center";
      this.dropdown.innerHTML = `
        <button class="language-option py-2 px-4 w-full text-left hover:bg-gray-200" data-lang="en">English</button>
        <button class="language-option py-2 px-4 w-full text-left hover:bg-gray-200" data-lang="de">Deutsch</button>
        <button class="language-option py-2 px-4 w-full text-left hover:bg-gray-200" data-lang="fr">Français</button>
      `;
      
      const languageOptions = this.dropdown.querySelectorAll('.language-option');
      languageOptions.forEach((button) => {
        button.addEventListener('click', this.handleLanguageChange.bind(this));
      });
  
      document.body.appendChild(this.dropdown);
    }
  
    private handleLanguageChange(event: Event) {
      const language = (event.target as HTMLButtonElement).getAttribute('data-lang');
      if (language) {
        window.store.languageStore.set(language as SupportedLanguages);
        //todo api to usersAndAuth service to change language
        this.closeDropdown();
      }
    }

    private closeDropdown() {
      if (this.dropdown) {
        this.dropdown.classList.add('hidden');
      }
    }

    private handleClickOutside(event: MouseEvent) {
        // Check if the click is outside of the button and the dropdown
        if (
          this.dropdown && 
          !this.dropdown.contains(event.target as Node) && 
          !this.changeLanguageBtn.contains(event.target as Node)
        ) {
          this.closeDropdown();
        }
      }

  }
  

  customElements.define('change-language-button', ChangeLanguageButton);
  

  export {
    ChangeLanguageButton
  }