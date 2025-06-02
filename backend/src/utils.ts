import { WebSocket } from "ws";

// added by Steffen to check whether websocket is actually there and ready
function websocketIsReadyForSending(potentialWebsocket: null | WebSocket): potentialWebsocket is WebSocket
{
    return potentialWebsocket !== null &&
        potentialWebsocket.readyState === WebSocket.OPEN;
}

export {
    websocketIsReadyForSending
}