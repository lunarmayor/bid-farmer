require("dotenv").config();
const { Worker, isMainThread, workerData } = require("worker_threads");
const fetch = require("node-fetch");
const db = require("../db");

const formatOrder = (order) => {

  return {
    //  ...order,
    createdDate: new Date(order.created_date),
    maker: order.from_address,
    orderData: order.order,
    maker: order.order.maker,
    kind: "x2y2",
    side: "bid",
    price: order.order.price,
    closingDate: new Date(order.order.end_at),
    expirationDate: new Date(order.order.end_at),
    x2y2Id: order.id,

    orderHash: order.id,
    contract: order.protocol_address,
    price: order.current_price,
    feeBreakdown: order.taker_fees.map((fee) => ({
      bsp: Number(fee.basis_points),
      address: fee.account.address,
    })),
    status: orderStatus,

    orderType: order.order.is_collection_offer ? "collection-offer" : "basic",
    ...(order.order.is_collection_offer
      ? {
          tokenContract: order.order.currency,
        }
      : {
          tokenContract: order.order.currency,
          tokenId: 

      }),
  };
};


let count = 0;

(async () => {
  try {
    let config = await db.collection("jobConfig").findOne();
    const fetchBatch = async (cursor) => {
      let start = performance.now();
      let batch = await fetch(
        "https://api.x2y2.org/v1/events?type=offer&limit=200" +
          (cursor ? `&cursor=${cursor}` : ""),
        {
          headers: {
            "X-API-KEY": process.env.OPENSEA_API_KEY,
          },
        }
      ).then((res) => res.json());

      let { next, orders } = batch;

      let current = db.bulkWrite(
        orders
          .map(formatOrder)
          .filter(
            (order) =>
              !config.lastFetched ||
              +new Date(order.createdAt) > +new Date(config.lastFetchedX2Y2)
          )
          .map((order) => ({
            updateOne: {
              update: {
                filter: { x2y2Id: order.x2y2Id },
                $set: order,
              },
            },
          }))
      );

      let newestOrderDate = orders[0].createdAt;
      let oldestOrderDate = orders[orders.length - 1].createdAt;

      if (count === 0) {
        await db.collection("jobConfig").updateOne(
          {},
          {
            $set: {
              lastFetchedX2Y2: new Date(newestOrderDate),
            },
          }
        );
      }
      let endTime = performance.now();
      let time = endTime - start;
      count += 1;

      if (
        config.lastFetchedX2Y2 &&
        +new Date(config.lastFetchedX2Y2) < +new Date(oldestOrderDate)
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
