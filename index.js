require("dotenv").config();
const db = require("./db");
const fetch = require("node-fetch");

const bidTracker = require("./bidTracker");
const cancelTracker = require("./cancelTracker");
const bidFarmer = require("./bidFarmer");
const Hapi = require("@hapi/hapi");
const { PromisePool } = require("@supercharge/promise-pool");

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

  let { results, errors } = await PromisePool.withConcurrency(20)
    .for([...Array(10000).keys()])
    .process(async (i) => {
      let res = await fetch(
        `https://looksrare.org/api/os/asset/0xBC4CA0EdA7647A8aB7C2061c2E118A18a936f13D/${i}`
      ).then((res) => res.json());

      return {
        tokenId: i,
        isBanned: res,
      };
    });

  console.log(results, errors);

  if (false) {
    return bidTracker();
  }
  //bidFarmer();
};

process.on("unhandledRejection", (err) => {
  console.log(err);
  process.exit(1);
});

init();
