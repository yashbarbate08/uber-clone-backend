const dotenv = require("dotenv");
const morgan = require("morgan");
dotenv.config();

const express = require("express");
const cors = require("cors");
const connectToDB = require("./db/db");
const userRoutes = require("./routes/user.routes");
const captionRoutes = require("./routes/caption.routes");
const cookieParser = require("cookie-parser");
const mapsRoutes = require("./routes/maps.routes");
const rideRoutes = require("./routes/ride.routes");

const app = express();
app.use(express.json());
app.use(cookieParser());

// Middleware
app.use(
  cors({
    origin: [
      "http://localhost:5173",
      "https://uber-clone-frontend-eta.vercel.app",
    ],
    methods: ["GET", "POST", "PUT", "DELETE"],
    credentials: true,
  })
);
app.use(morgan("dev"));

app.use(express.urlencoded({ extended: true }));

// Connect to DB
connectToDB();

// Routes
app.get("/", (req, res) => {
  res.send("Hello Brother");
});

app.use("/users", userRoutes);
app.use("/captions", captionRoutes);
app.use("/maps", mapsRoutes);
app.use("/rides", rideRoutes);

module.exports = app;
