const mysql = require("mysql2");
require("dotenv").config();

const connectionString =
  process.env.DATABASE_URL ||
  process.env.MYSQL_URL ||
  process.env.MYSQL_PUBLIC_URL ||
  process.env.DB_URL;

const dbConfig = connectionString
  ? connectionString
  : {
      host: process.env.DB_HOST || process.env.MYSQLHOST || "localhost",
      port: Number(process.env.DB_PORT || process.env.MYSQLPORT || 3306),
      user: process.env.DB_USER || process.env.MYSQLUSER,
      password: process.env.DB_PASSWORD || process.env.MYSQLPASSWORD,
      database: process.env.DB_NAME || process.env.MYSQLDATABASE,
    };

const db = mysql.createPool({
  ...((typeof dbConfig === "string" ? { uri: dbConfig } : dbConfig)),
  waitForConnections: true,
  connectionLimit: Number(process.env.DB_CONNECTION_LIMIT || 10),
  queueLimit: 0,
});

db.getConnection((err, connection) => {
  if (err) {
    console.log("DB connection failed:", err.message);
    return;
  }
  console.log("MySQL connected!");
  connection.release();
});

module.exports = db;
