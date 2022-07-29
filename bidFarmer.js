const opensea = require("./opensea");
const db = require("./db");
const Bree = require("bree");

const bidTracker = async () => {
  const bree = new Bree({
    jobs: [
      {
        name: "fetchOffers",
        cron: "*/2 * * * *",
        //closeWorkerAfterMs: 5900 * 2,
        worker: {
          workerData: {
            key: process.env.OPENSEA_API_KEY,
          },
        },
      },
      {
        name: "fetchOffers2",
        path: "./jobs/fetchOffers.js",
        cron: "1/2 * * * *",
        //closeWorkerAfterMs: 5900 * 2,
        worker: {
          workerData: {
            key: process.env.OPENSEA_API_KEY2,
          },
        },
      },
      {
        name: "fetchHistoricalOffers",
        path: "./jobs/fetchHistoricalOffers.js",
        worker: {
          workerData: {
            key: process.env.OPENSEA_API_KEY2,
          },
        },
      },
    ],
  });

  await bree.start();
};

module.exports = bidTracker;
