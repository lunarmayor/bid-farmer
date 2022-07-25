require("dotenv").config();
const db = require("./db");

const bidTracker = require("./bidTracker");
const cancelTracker = require("./cancelTracker");
const bidFarmer = require("./bidFarmer");
const Hapi = require("@hapi/hapi");

const init = async () => {
  const server = Hapi.server({
    port: process.env.PORT || 3000,
    host: process.env.HOST || "0.0.0.0",
  });

  server.route({
    method: "GET",
    path: "/",
    handler: (request, h) => {
      return "Hello World!";
    },
  });

  await server.start();
  console.log("Server running on %s", server.info.uri);

  if (false) {
    return bidTracker();
  }
//  bidFarmer();
};

process.on("unhandledRejection", (err) => {
  console.log(err);
  process.exit(1);
});

init();
