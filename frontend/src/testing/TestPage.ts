import { colog, GameServiceTypes, MatchMakingTypes } from "transcendence";
import { createHtmlElementFromString, navigateToSite } from "../utils/utils";
import { GameServiceInterface } from "../backendInterface/gameServiceInterface";

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
    this.innerHTML = `
      <button id="testButton">SEND REQUEST</button>
      <button id="sendReady">READY</button>
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
    //   document.querySelector("#testButton")?.addEventListener("click", () => {
    //     colog("clicked!");
    //     const game: MatchMakingTypes.BasicGameFull = {
    //       hostId: "test",
    //       oponentId: "test",
    //       matchId: "testMatch",
    //     }
    //     fetch("http://10.15.204.5:3000/api/game/start", {
    //       method: "POST",
    //       headers: {
    //         "Content-Type": "application/json",
    //       },
    //       body: JSON.stringify(game),
    //     })
    //       .then((response) => response.json()) // Parse JSON response
    //       .then((data) => console.log(data)) // Handle the response data
    //       .catch((error) => console.error("Error:", error)); // Handle errors
    //   });
    // }

    document.querySelector("#testButton")?.addEventListener("click", () => {
      GameServiceInterface.connect();
    });

    document.querySelector("#sendReady")?.addEventListener("click", () => {
      GameServiceInterface.sendMessageToServer({
        type: "clientIsReady",
        data: {
          clientId: window.store.userStore.get().id,
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
