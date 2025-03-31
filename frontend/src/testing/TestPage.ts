import { colog, GameServiceTypes, MatchMakingTypes } from "transcendence";
import {
  buildBackendRoute,
  createHtmlElementFromString,
  navigateToSite,
} from "../utils/utils";
import { GameServiceInterface } from "../backendInterface/gameServiceInterface";
import { CentralModalListeners } from "../pages/CentralModalListeners";

class TestPage extends HTMLElement {
  constructor() {
    super();
  }

  connectedCallback() {
    // const modal = createHtmlElementFromString(`<central-modal>
    //   <h2 class="text-xl font-bold">Confirm Action</h2>
    //   <p>Are you sure you want to proceed?</p>
    // </central-modal>`);
    // this.appendChild(modal);
    // colog(modal);
    // colog(this);

    // this.innerHTML = `
    //   <central-modal>
    //     HELLO WORLD!
    //     <h2 class="text-xl font-bold">Confirm Action</h2>
    //     <!-- <p>Are you sure you want to proceed?</p> -->
    //   </central-modal>
    // `;
    this.render();
  }

  disconnectedCallback() {}

  render() {
    const modal = createHtmlElementFromString(`<central-modal-listeners>HELLO WORLD</central-modal-listeners>`) as CentralModalListeners;
    colog(modal);
    this.innerHTML = "";
    this.appendChild(modal);
    modal.open();
    modal.setKeyListener (
      {
        "Space": () => console.log("space pressed"),
        "ArrowUp": () => console.log("space pressed"),
        "ArrowDown": () => console.log("space pressed"),
      }
    );

    this.innerHTML = `
      <button id="testButton">SEND REQUEST</button>
      <button id="sendReady">READY</button>
      <register-page></register-page>
      <!-- <central-modal>
        HELLO WORLD!
        <h2 class="text-xl font-bold">Confirm Action</h2>
        <p>Are you sure you want to proceed?</p>
      </central-modal> -->
    `;
    // this.innerHTML = `
    // <div class="bg-black h-full w-full">

    // </div>
    // `;
      // document.querySelector("#testButton")?.addEventListener("click", () => {
      //   colog("clicked!");
      //   const game: MatchMakingTypes.BasicGameFull = {
      //     hostId: "test",
      //     oponentId: "test",
      //     matchId: "testMatch",
      //   }
      //   fetch("http://localhost:3000/api/game/start", {
      //     method: "POST",
      //     headers: {
      //       "Content-Type": "application/json",
      //     },
      //     body: JSON.stringify(game),
      //   })
      //     .then((response) => response.json()) // Parse JSON response
      //     .then((data) => console.log(data)) // Handle the response data
      //     .catch((error) => console.error("Error:", error)); // Handle errors
      // });

    document.querySelector("#testButton")?.addEventListener("click",async () => {
      await GameServiceInterface.connect();
      colog("HELLO WORLD!");
    });

    document.querySelector("#sendReady")?.addEventListener("click", () => {
      GameServiceInterface.sendMessageToServer({
        type: "clientIsReady",
        data: {
          clientId: window.store.userStore.get().id,
          matchId: "dsf"
        },
      });

      // const address = "http://10.15.204.5:3000/ws";
      // const websocket = new WebSocket(
      //   `${address}?clientId=HELLO_LEO}`
      // // const websocket = new WebSocket(
      // //   `ws://localhost:4000?clientId=${window.store.userStore.get().id}`
      // );
    });
  }
}

customElements.define("test-page", TestPage);

export { TestPage };
