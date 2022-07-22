const { MongoClient } = require("mongodb");
// Connection URI
const uri = process.env.DATABASE_URL;
// Create a new MongoClient
const client = new MongoClient(uri);
module.exports = client.db("reservoir");
