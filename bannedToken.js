const opensea = require("./opensea");
const db = require("./db");
const Bree = require("bree");

const bannedToken = async () => {
  const bree = new Bree({
    jobs: [
      {
        name: "bannedTokenChecker",
        cron: "*/10 * * * *",
      },
    ],
  });

  await bree.run("bannedTokenChecker");
  await bree.start();
};

module.exports = bannedToken;
