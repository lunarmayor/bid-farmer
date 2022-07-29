const opensea = require("./opensea");
const db = require("./db");
const Bree = require("bree");

const bannedToken = async () => {
  const bree = new Bree({
    jobs: [
      {
        name: "bannedTokenChecker",
        cron: "*/10 * * * *",
        timeout: 0,
      },
    ],
  });

  await bree.start();
};

module.exports = bannedToken;
