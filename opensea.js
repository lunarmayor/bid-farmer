const { OpenSeaStreamClient } = require("@opensea/stream-js");
const { WebSocket } = require("ws");

const client = new OpenSeaStreamClient({
  token: process.env.OPENSEA_API_KEY,
  connectOptions: {
    transport: WebSocket,
  },
});

module.exports = client;
