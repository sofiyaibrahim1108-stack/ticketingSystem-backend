import express from "express";
import dotenv from "dotenv";
import "dotenv/config";
import mysql from "mysql2";
import cors from "cors";

import { requestLogger } from "./middleware/requestLogger.js";
import logger from "./utils/logger.js";

import { setUpAuthRoutes } from "./controllers/authController.js";
import { setUpUserRoutes } from "./controllers/userController.js";
import { setUpCategoryRoutes } from "./controllers/categoryController.js";
import { setUpTicketStatusRoutes } from "./controllers/ticketStatusController.js";
import { setUpTicketRoutes } from "./controllers/ticketController.js";
import { setUpCommentRoutes } from "./controllers/commentController.js";

dotenv.config();
const app = express();

app.use(cors({
  origin: "http://localhost:5173",
  credentials: true
}));


app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(requestLogger);


app.set("view engine", "ejs");

const db = mysql.createPool({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0
});


db.getConnection((err, connection) => {
  if (err) {
    logger.error("DB Pool connection failed:", err);
  } else {
    logger.info("MySQL Pool connected!");
    connection.release();
  }
});


app.use((req, res, next) => {
  req.db = db;
  next();
});

app.get("/", (req, res) => {
  res.json({ success: true, message: "Ticketing System API Running" });
});

setUpAuthRoutes(app);
setUpUserRoutes(app);
setUpCategoryRoutes(app);
setUpTicketStatusRoutes(app);
setUpTicketRoutes(app)
setUpCommentRoutes(app)


app.use((err, req, res, next) => {
  logger.error(err.message);
  res.status(500).json({ success: false, message: "Server error" });
});


const PORT = process.env.PORT || 3003;
app.listen(PORT, () => {
  logger.info(` Server running at http://localhost:${PORT}`);
});