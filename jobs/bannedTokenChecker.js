require("dotenv").config();
const { Worker, isMainThread, workerData } = require("worker_threads");
const fetch = require("node-fetch");
const db = require("../db");
const { PromisePool } = require("@supercharge/promise-pool");

const collections = [
  { address: "0xBC4CA0EdA7647A8aB7C2061c2E118A18a936f13D", total: 10000 },
];

(async () => {
  for (const collection of collections) {
    let { results, errors } = await PromisePool.withConcurrency(100).for([
      ...Array(collection.total).keys(),
    ]);

    handleError(async (error, i) => {
      // you must collect errors yourself
      if (error instanceof ValidationError) {
        return errors.push(error);
      }

      console.log(i);
    }).process(async (i) => {
      let res = await fetch(
        `https://looksrare.org/api/os/asset/${collection.address}/${i}`
      ).then((res) => res.json());

      return {
        contract: collection.address,
        tokenId: i,
        isBanned: !res,
      };
    });
    console.log(JSON.stringify(errors));

    await db.collection("bannedTokenStatuses").bulkWrite(
      results.map(
        (token) => ({
          updateOne: {
            filter: { tokenId: token.tokenId, contract: token.contract },
            update: {
              $set: token,
            },
            upsert: true,
          },
        }),
        { ordered: false }
      )
    );
  }
})();
