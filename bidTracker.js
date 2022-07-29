const opensea = require("./opensea");
const db = require("./db");
const { Observable, filter, bufferTime } = require("rxjs");

const bidTracker = () => {
  const bidsCollection = db.collection("bidEvents");

  const bids$ = new Observable((subscriber) => {
    opensea.onItemReceivedBid("*", async (event) => {
      let { payload } = event;
      let { item } = payload;
      console.log(event);

      subscriber.next({
        id: item.nft_id,
        chain: item.nft_id.split("/")[0],
        tokenId: item.nft_id.split("/")[2],
        contract: item.nft_id.split("/")[1],
        price: payload.base_price,
        createdAt: payload.event_timestamp,
        expirationDate: new Date(payload.expiration_date),
        collection: payload.collection.slug,
        maker: payload.maker.address,
        quantity: payload.quantity,
      });
    });
  });

  bids$
    .pipe(
      // flush events every 1 second
      bufferTime(800),
      // move next only if there is at least one event
      filter((events) => events.length > 0)
    )
    .subscribe(async (events) => {
      await bidsCollection.insertMany(events);
    });
};

module.exports = bidTracker;
