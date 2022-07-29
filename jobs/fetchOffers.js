require("dotenv").config();
const { Worker, isMainThread, workerData } = require("worker_threads");
const fetch = require("node-fetch");
const db = require("../db");
const formatOrder = require("../formatSeaportOrder");

let count = 0;

(async () => {
  console.log(workerData);
  try {
    let config = await db.collection("jobConfig").findOne();
    const fetchBatch = async (cursor) => {
      let start = performance.now();
      let batch = await fetch(
        "https://api.opensea.io/v2/orders/ethereum/seaport/offers?limit=50" +
          (cursor ? `&cursor=${cursor}` : ""),
        {
          headers: {
            "X-API-KEY": workerData.key,
          },
        }
      ).then((res) => res.json());

      let { next, orders } = batch;

      let current = db
        .collection("bids")
        .insertMany(
          orders
            .map(formatOrder)
            .filter(
              (order) =>
                !config.lastFetched ||
                +new Date(order.createdDate) > +new Date(config.lastFetched)
            )
        );
      let newestOrderDate = orders[0].created_date;
      let oldestOrderDate = orders[orders.length - 1].created_date;

      if (count === 0) {
        await db.collection("jobConfig").updateOne(
          {},
          {
            $set: {
              lastFetched: new Date(newestOrderDate),
            },
          }
        );
      }
      let endTime = performance.now();
      let time = endTime - start;
      count += 1;

      if (
        config.lastFetched &&
        +new Date(config.lastFetched) < +new Date(oldestOrderDate)
      ) {
        setTimeout(() => {
          fetchBatch(next);
        }, Math.max(0, 500 - time));
      } else {
        current.then(() => {
          process.exit(0);
        });
      }
    };

    fetchBatch();
  } catch (err) {
    console.log(err);
  }
})();
