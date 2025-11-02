const mongoose = require("mongoose");
const colors = require("colors");
const conectDB = async function () {
  try {
    const conn = await mongoose.connect(process.env.mongo_uri);
    console.log(`mongodb is connected to ${conn.connection.host}`.yellow);
  } catch (err) {
    console.log(err.message);
  }
};
module.exports = conectDB;
