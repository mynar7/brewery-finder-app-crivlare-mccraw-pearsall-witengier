const mysql = require("mysql2");

const config = process.env.JAWSDB_URL || {
  connectionLimit: 10,
  host: "localhost",
  user: "root",
  database: "brewery_finder_app_db",
};
const db = mysql.createPool(config);

module.exports = db.promise();