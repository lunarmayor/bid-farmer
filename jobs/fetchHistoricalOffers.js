require("dotenv").config();
const { Worker, isMainThread, workerData } = require("worker_threads");
const fetch = require("node-fetch");
const db = require("../db");

const formatOrder = (order) => {
  return {
    ...order,
    created_date: new Date(order.created_date),
    closing_date: new Date(order.closing_date),
    expiration_date: new Date(order.expiration_date),
  };
};

(async () => {
  try {
    let config = await db.collection("jobConfig").findOne();
    const { cursor: historicalCursor } = config;

    const fetchBatch = async (cursor) => {
      let start = performance.now();

      let batch = await fetch(
        "https://api.opensea.io/v2/orders/ethereum/seaport/offers?limit=50" +
          (cursor ? `&cursor=${cursor}` : ""),
        {
          headers: {
            "X-API-KEY": process.env.OPENSEA_API_KEY2,
          },
        }
      ).then((res) => res.json());

      let { next, orders } = batch;

      try {
        let bids = await db
          .collection("bids")
          .insertMany(orders.map(formatOrder));

        await db.collection("jobConfig").updateOne(
          {},
          {
            $set: {
              cursor: next,
            },
          }
        );

        let endTime = performance.now();
        let time = endTime - start;

        if (orders.length < 50) {
          console.log("done");
          return process.exit(0);
        } else {
          setTimeout(() => {
            fetchBatch(next);
          }, Math.max(0, 1000 - time));
        }
      } catch (err) {
        return process.exit(0);
      }
    };

    fetchBatch(historicalCursor);
  } catch (err) {
    console.log(err);
  }
})();
