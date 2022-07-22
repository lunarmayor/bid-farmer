const opensea = require("./opensea");
const db = require("./db");
const { Observable, filter, bufferTime } = require("rxjs");

const cancelTracker = () => {
  const bidsCollection = db.collection("bidEvents");

  const bids$ = new Observable((subscriber) => {
    opensea.onItemSold("*", async (event) => {
      let { payload } = event;
      let { item } = payload;
      return console.log(event);

      //
      subscriber.next({
        id: item.nft_id,
        price: payload.base_price,
        createdAt: payload.event_timestamp,
        expirationData: payload.expiration_date,
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
      //await bidsCollection.insertMany(events);
    });
};

module.exports = cancelTracker;
